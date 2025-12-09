import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateInvoiceRequest {
  organizationId: string;
  customChargeIds?: string[];
  amount?: number;
  description?: string;
  dueDate?: string;
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
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      throw new Error('Admin access required');
    }

    const body: GenerateInvoiceRequest = await req.json();

    const { data: invoiceNumberData } = await supabase.rpc('generate_invoice_number');
    const invoiceNumber = invoiceNumberData || `INV-${Date.now()}`;

    let lineItems = [];
    let totalAmount = 0;

    if (body.customChargeIds && body.customChargeIds.length > 0) {
      const { data: charges } = await supabase
        .from('custom_charges')
        .select('*')
        .in('id', body.customChargeIds)
        .eq('status', 'approved');

      if (charges) {
        lineItems = charges.map((charge: any) => ({
          description: charge.description,
          quantity: charge.hours || 1,
          unit_price: charge.hourly_rate || charge.amount,
          amount: charge.amount,
        }));

        totalAmount = charges.reduce((sum: number, charge: any) => sum + Number(charge.amount), 0);

        for (const charge of charges) {
          await supabase
            .from('custom_charges')
            .update({ status: 'billed' })
            .eq('id', charge.id);
        }
      }
    } else if (body.amount) {
      lineItems = [{
        description: body.description || 'Custom service',
        quantity: 1,
        unit_price: body.amount,
        amount: body.amount,
      }];
      totalAmount = body.amount;
    }

    const dueDate = body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        organization_id: body.organizationId,
        amount: totalAmount,
        subtotal: totalAmount,
        tax_amount: 0,
        currency: 'GBP',
        status: 'sent',
        type: body.customChargeIds ? 'consulting' : 'custom',
        description: body.description,
        line_items: lineItems,
        due_date: dueDate,
        created_by: user.id,
      })
      .select()
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    if (body.customChargeIds) {
      await supabase
        .from('custom_charges')
        .update({ invoice_id: invoice.id })
        .in('id', body.customChargeIds);
    }

    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', body.organizationId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          ...invoice,
          organization_name: organization?.name,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Invoice generation error:', error);
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
