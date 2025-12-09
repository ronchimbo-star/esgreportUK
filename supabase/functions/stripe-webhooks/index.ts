import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeWebhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(body);
      
      const parts = signature!.split(',');
      const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
      const sigs = parts.filter(p => p.startsWith('v1='));
      
      const payload = `${timestamp}.${body}`;
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(stripeWebhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
      
      const expectedSig = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
      );
      
      const expectedSigHex = Array.from(new Uint8Array(expectedSig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const isValid = sigs.some(sig => {
        const sigValue = sig.split('=')[1];
        return sigValue === expectedSigHex;
      });

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      event = JSON.parse(body);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Processing event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const organizationId = session.metadata.organization_id;
        const tier = session.metadata.tier;
        const subscriptionId = session.subscription;

        await supabase
          .from('organizations')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', organizationId);

        await supabase
          .from('subscription_history')
          .insert({
            organization_id: organizationId,
            to_tier: tier,
            to_status: 'active',
            change_type: 'create',
            effective_date: new Date().toISOString(),
          });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const organizationId = subscription.metadata.organization_id;

        await supabase
          .from('organizations')
          .update({
            subscription_status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await supabase
          .from('organizations')
          .update({
            subscription_status: 'cancelled',
            subscription_expires_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const organizationId = invoice.metadata?.organization_id;

        if (organizationId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', organizationId)
            .single();

          if (org) {
            const invoiceNumber = await generateInvoiceNumber(supabase);

            await supabase
              .from('invoices')
              .insert({
                invoice_number: invoiceNumber,
                organization_id: organizationId,
                amount: invoice.amount_paid / 100,
                subtotal: invoice.subtotal / 100,
                tax_amount: (invoice.tax || 0) / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'paid',
                type: 'subscription',
                stripe_invoice_id: invoice.id,
                paid_date: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
              });

            await supabase
              .from('payments')
              .insert({
                organization_id: organizationId,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                payment_method: 'card',
                stripe_payment_id: invoice.payment_intent,
                stripe_charge_id: invoice.charge,
                status: 'succeeded',
              });
          }
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        await supabase
          .from('organizations')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_customer_id', invoice.customer);

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function generateInvoiceNumber(supabase: any): Promise<string> {
  const { data } = await supabase.rpc('generate_invoice_number');
  return data || `INV-${Date.now()}`;
}
