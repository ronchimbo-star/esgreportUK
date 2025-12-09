/*
  # Create Billing and Payment System

  ## Overview
  This migration creates a comprehensive billing system for the ESG reporting platform,
  enabling subscription management, invoicing, payment tracking, and custom charges.

  ## New Tables
  
  ### 1. `invoices`
  Stores all invoices generated for organizations
  - `id` (uuid, primary key)
  - `invoice_number` (varchar, unique) - Human-readable invoice number
  - `organization_id` (uuid) - Links to organization
  - `amount` (numeric) - Total invoice amount
  - `subtotal` (numeric) - Amount before tax
  - `tax_amount` (numeric) - Tax amount
  - `currency` (varchar) - Currency code (GBP, USD, EUR)
  - `status` (varchar) - draft, sent, paid, overdue, cancelled, refunded
  - `type` (varchar) - subscription, custom, consulting
  - `description` (text) - Invoice description
  - `line_items` (jsonb) - Array of line items
  - `due_date` (timestamptz) - Payment due date
  - `paid_date` (timestamptz) - When payment was received
  - `pdf_url` (text) - URL to PDF invoice
  - `stripe_invoice_id` (varchar) - Stripe invoice ID
  - `notes` (text) - Internal notes
  - `created_by` (uuid) - User who created invoice
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `payments`
  Tracks all payment transactions
  - `id` (uuid, primary key)
  - `invoice_id` (uuid) - Links to invoice
  - `organization_id` (uuid) - Links to organization
  - `amount` (numeric) - Payment amount
  - `currency` (varchar)
  - `payment_method` (varchar) - card, bank_transfer, paypal, etc
  - `stripe_payment_id` (varchar) - Stripe payment intent ID
  - `stripe_charge_id` (varchar) - Stripe charge ID
  - `status` (varchar) - pending, succeeded, failed, refunded, cancelled
  - `failure_reason` (text) - Reason for failure
  - `receipt_url` (text) - URL to payment receipt
  - `metadata` (jsonb) - Additional payment metadata
  - `created_at` (timestamptz)

  ### 3. `custom_charges`
  Ad-hoc charges for consulting and custom work
  - `id` (uuid, primary key)
  - `organization_id` (uuid)
  - `description` (text) - Service description
  - `amount` (numeric)
  - `currency` (varchar)
  - `hours` (numeric) - Hours worked (if applicable)
  - `hourly_rate` (numeric) - Rate per hour
  - `status` (varchar) - draft, approved, billed, paid
  - `invoice_id` (uuid) - Links to invoice when billed
  - `billed_by` (uuid) - Admin who created charge
  - `approved_by` (uuid) - Admin who approved
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `subscription_history`
  Tracks subscription plan changes
  - `id` (uuid, primary key)
  - `organization_id` (uuid)
  - `from_tier` (varchar) - Previous subscription tier
  - `to_tier` (varchar) - New subscription tier
  - `from_status` (varchar) - Previous status
  - `to_status` (varchar) - New status
  - `change_type` (varchar) - upgrade, downgrade, cancel, reactivate
  - `effective_date` (timestamptz) - When change takes effect
  - `proration_amount` (numeric) - Proration credit/charge
  - `changed_by` (uuid) - User who made change
  - `reason` (text) - Reason for change
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 5. `payment_methods`
  Stored payment methods for organizations
  - `id` (uuid, primary key)
  - `organization_id` (uuid)
  - `stripe_payment_method_id` (varchar)
  - `type` (varchar) - card, bank_account
  - `card_brand` (varchar) - visa, mastercard, etc
  - `card_last4` (varchar)
  - `card_exp_month` (int)
  - `card_exp_year` (int)
  - `is_default` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Organizations can only see their own financial data
  - Admins can see all financial data
  - Custom charges require admin role
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number varchar(50) UNIQUE NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  subtotal numeric(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_amount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  currency varchar(3) NOT NULL DEFAULT 'GBP',
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')),
  type varchar(20) NOT NULL DEFAULT 'subscription' CHECK (type IN ('subscription', 'custom', 'consulting')),
  description text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  due_date timestamptz,
  paid_date timestamptz,
  pdf_url text,
  stripe_invoice_id varchar(255),
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  currency varchar(3) NOT NULL DEFAULT 'GBP',
  payment_method varchar(50),
  stripe_payment_id varchar(255),
  stripe_charge_id varchar(255),
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')),
  failure_reason text,
  receipt_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create custom_charges table
CREATE TABLE IF NOT EXISTS custom_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  currency varchar(3) NOT NULL DEFAULT 'GBP',
  hours numeric(6, 2),
  hourly_rate numeric(10, 2),
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'billed', 'paid')),
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  billed_by uuid NOT NULL REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_tier varchar(50),
  to_tier varchar(50),
  from_status varchar(50),
  to_status varchar(50),
  change_type varchar(20) NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate', 'create')),
  effective_date timestamptz NOT NULL DEFAULT now(),
  proration_amount numeric(10, 2) DEFAULT 0,
  changed_by uuid REFERENCES users(id),
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id varchar(255) NOT NULL,
  type varchar(20) NOT NULL CHECK (type IN ('card', 'bank_account')),
  card_brand varchar(50),
  card_last4 varchar(4),
  card_exp_month int,
  card_exp_year int,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_organization ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_custom_charges_organization ON custom_charges(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_charges_status ON custom_charges(status);
CREATE INDEX IF NOT EXISTS idx_subscription_history_organization ON subscription_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_organization ON payment_methods(organization_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Organizations can view their own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for payments
CREATE POLICY "Organizations can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for custom_charges
CREATE POLICY "Organizations can view their own custom charges"
  ON custom_charges FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage custom charges"
  ON custom_charges FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for subscription_history
CREATE POLICY "Organizations can view their own subscription history"
  ON subscription_history FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert subscription history"
  ON subscription_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for payment_methods
CREATE POLICY "Organizations can view their own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organizations can manage their own payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS varchar AS $$
DECLARE
  next_number int;
  invoice_num varchar;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS int)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number ~ '^INV-[0-9]+$';
  
  invoice_num := 'INV-' || LPAD(next_number::text, 6, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice updated_at
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invoice updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

-- Function to update custom_charges updated_at
CREATE OR REPLACE FUNCTION update_custom_charge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for custom_charges updated_at
CREATE TRIGGER update_custom_charges_updated_at
  BEFORE UPDATE ON custom_charges
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_charge_updated_at();

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND (
    OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier OR
    OLD.subscription_status IS DISTINCT FROM NEW.subscription_status
  )) THEN
    INSERT INTO subscription_history (
      organization_id,
      from_tier,
      to_tier,
      from_status,
      to_status,
      change_type,
      effective_date
    ) VALUES (
      NEW.id,
      OLD.subscription_tier,
      NEW.subscription_tier,
      OLD.subscription_status,
      NEW.subscription_status,
      CASE
        WHEN NEW.subscription_status = 'cancelled' THEN 'cancel'
        WHEN OLD.subscription_status = 'cancelled' THEN 'reactivate'
        WHEN NEW.subscription_tier > OLD.subscription_tier THEN 'upgrade'
        WHEN NEW.subscription_tier < OLD.subscription_tier THEN 'downgrade'
        ELSE 'create'
      END,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription changes
DROP TRIGGER IF EXISTS log_organization_subscription_changes ON organizations;
CREATE TRIGGER log_organization_subscription_changes
  AFTER UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();
