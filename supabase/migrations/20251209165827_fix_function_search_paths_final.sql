/*
  # Fix Function Search Paths for Security

  1. Problem
    - Functions with mutable search_path are vulnerable to search_path attacks
    
  2. Solution
    - Drop and recreate functions with explicit search_path
    - Add `SECURITY DEFINER` and `SET search_path = pg_catalog, public`
    - Recreate dependent triggers

  3. Security Benefits
    - Prevents search_path manipulation attacks
    - Ensures functions execute in a safe context
    - Maintains function security with SECURITY DEFINER
*/

DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
CREATE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  sequence_num INT;
BEGIN
  year_month := to_char(CURRENT_DATE, 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INT)), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '%';
  
  new_number := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

DROP FUNCTION IF EXISTS update_invoice_updated_at() CASCADE;
CREATE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

DROP FUNCTION IF EXISTS update_custom_charge_updated_at() CASCADE;
CREATE FUNCTION update_custom_charge_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_custom_charges_updated_at ON custom_charges;
CREATE TRIGGER update_custom_charges_updated_at
  BEFORE UPDATE ON custom_charges
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_charge_updated_at();

DROP FUNCTION IF EXISTS log_subscription_change() CASCADE;
CREATE FUNCTION log_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
    OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier OR
    OLD.subscription_status IS DISTINCT FROM NEW.subscription_status
  ) THEN
    INSERT INTO subscription_history (
      organization_id,
      from_tier,
      to_tier,
      from_status,
      to_status,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      OLD.subscription_tier,
      NEW.subscription_tier,
      OLD.subscription_status,
      NEW.subscription_status,
      auth.uid(),
      'Subscription updated'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_organization_subscription_changes ON organizations;
CREATE TRIGGER log_organization_subscription_changes
  AFTER UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

DROP FUNCTION IF EXISTS get_user_organization_id(UUID) CASCADE;
CREATE FUNCTION get_user_organization_id(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM users
  WHERE id = user_uuid;
  
  RETURN org_id;
END;
$$;

DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
CREATE FUNCTION get_user_role(user_uuid UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_uuid;
  
  RETURN user_role;
END;
$$;

DROP FUNCTION IF EXISTS update_updated_at_timestamp() CASCADE;
CREATE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_esg_reports_updated_at ON esg_reports;
CREATE TRIGGER update_esg_reports_updated_at
  BEFORE UPDATE ON esg_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP FUNCTION IF EXISTS create_user_preferences() CASCADE;
CREATE FUNCTION create_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_user_preferences_trigger ON users;
CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_preferences();

DROP FUNCTION IF EXISTS update_user_preferences_updated_at() CASCADE;
CREATE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_preferences_updated_at_trigger ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at_trigger
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

DROP FUNCTION IF EXISTS make_user_admin(UUID) CASCADE;
CREATE FUNCTION make_user_admin(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE users
  SET role = 'admin'
  WHERE id = user_uuid;
END;
$$;

DROP FUNCTION IF EXISTS make_user_super_admin(UUID) CASCADE;
CREATE FUNCTION make_user_super_admin(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE users
  SET role = 'super_admin'
  WHERE id = user_uuid;
END;
$$;
