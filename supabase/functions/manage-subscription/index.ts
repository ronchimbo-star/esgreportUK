import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ManageSubscriptionRequest {
  action: 'cancel' | 'reactivate' | 'update' | 'portal';
  newTier?: string;
  newPriceId?: string;
}

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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error('Stripe is not configured');
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, organizations(id, name, stripe_customer_id, stripe_subscription_id, subscription_tier, subscription_status)')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      throw new Error('Organization not found');
    }

    const organization = userData.organizations as any;

    if (req.method === 'GET') {
      if (!organization.stripe_subscription_id) {
        return new Response(
          JSON.stringify({ subscription: null }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const subscriptionResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${organization.stripe_subscription_id}`,
        {
          headers: { 'Authorization': `Bearer ${stripeSecretKey}` },
        }
      );

      if (!subscriptionResponse.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const subscription = await subscriptionResponse.json();

      return new Response(
        JSON.stringify({ subscription }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST') {
      const body: ManageSubscriptionRequest = await req.json();

      if (body.action === 'portal') {
        const sessionParams = new URLSearchParams({
          customer: organization.stripe_customer_id,
          return_url: `${req.headers.get('origin')}/dashboard/billing`,
        });

        const portalResponse = await fetch(
          'https://api.stripe.com/v1/billing_portal/sessions',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeSecretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: sessionParams,
          }
        );

        if (!portalResponse.ok) {
          throw new Error('Failed to create portal session');
        }

        const portalSession = await portalResponse.json();

        return new Response(
          JSON.stringify({ url: portalSession.url }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (body.action === 'cancel') {
        const cancelResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${organization.stripe_subscription_id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${stripeSecretKey}`,
            },
          }
        );

        if (!cancelResponse.ok) {
          throw new Error('Failed to cancel subscription');
        }

        await supabase
          .from('organizations')
          .update({
            subscription_status: 'cancelled',
          })
          .eq('id', organization.id);

        await supabase
          .from('subscription_history')
          .insert({
            organization_id: organization.id,
            from_tier: organization.subscription_tier,
            from_status: organization.subscription_status,
            to_status: 'cancelled',
            change_type: 'cancel',
            changed_by: user.id,
          });

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (body.action === 'update' && body.newPriceId) {
        const subscriptionResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${organization.stripe_subscription_id}`,
          {
            headers: { 'Authorization': `Bearer ${stripeSecretKey}` },
          }
        );

        const subscription = await subscriptionResponse.json();
        const itemId = subscription.items.data[0].id;

        const updateParams = new URLSearchParams({
          'items[0][id]': itemId,
          'items[0][price]': body.newPriceId,
          'proration_behavior': 'create_prorations',
        });

        const updateResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${organization.stripe_subscription_id}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeSecretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: updateParams,
          }
        );

        if (!updateResponse.ok) {
          throw new Error('Failed to update subscription');
        }

        await supabase
          .from('organizations')
          .update({
            subscription_tier: body.newTier,
          })
          .eq('id', organization.id);

        const changeType = body.newTier! > organization.subscription_tier ? 'upgrade' : 'downgrade';

        await supabase
          .from('subscription_history')
          .insert({
            organization_id: organization.id,
            from_tier: organization.subscription_tier,
            to_tier: body.newTier,
            change_type: changeType,
            changed_by: user.id,
          });

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Subscription management error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
