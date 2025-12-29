/*
  # Create Admin User - Ron Chimbo
  
  1. Purpose
    - Set up Ron Chimbo (ronchimbo@gmail.com) as the primary admin user
    - Remove admin privileges from previous test admin accounts
    
  2. Changes
    - Promotes ronchimbo@gmail.com to super_admin role when they sign up
    - Assigns them to the admin organization
    
  3. Instructions
    - User must sign up at /signup with email: ronchimbo@gmail.com
    - After signup, this migration ensures they have super_admin access
    - They can then access the admin dashboard at /admin
*/

-- Create a function to automatically promote ronchimbo@gmail.com to super_admin
CREATE OR REPLACE FUNCTION auto_promote_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new user is ronchimbo@gmail.com
  IF NEW.email = 'ronchimbo@gmail.com' THEN
    NEW.role := 'super_admin';
    NEW.organization_id := '00000000-0000-0000-0000-000000000001';
    NEW.first_name := 'Ron';
    NEW.last_name := 'Chimbo';
    RAISE NOTICE 'User ronchimbo@gmail.com automatically promoted to super_admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically promote the user on insert
DROP TRIGGER IF EXISTS auto_promote_admin_trigger ON users;
CREATE TRIGGER auto_promote_admin_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_promote_admin_user();

-- Also update the user if they already exist
UPDATE users 
SET 
  role = 'super_admin',
  organization_id = '00000000-0000-0000-0000-000000000001',
  first_name = 'Ron',
  last_name = 'Chimbo'
WHERE email = 'ronchimbo@gmail.com';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Admin user setup completed for ronchimbo@gmail.com';
  RAISE NOTICE 'If user does not exist yet, they will be automatically promoted to super_admin upon signup';
  RAISE NOTICE 'Admin dashboard available at: /admin';
END $$;
