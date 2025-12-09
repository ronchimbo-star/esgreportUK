/*
  # Fix Infinite Recursion in Users Table RLS Policies

  1. Problem
    - Users table policies query the users table itself
    - This creates infinite recursion during INSERT operations
    - Error: "infinite recursion detected in policy for relation 'users'"

  2. Solution
    - Drop existing problematic policies
    - Create new policies that don't create circular dependencies
    - Allow INSERT for authenticated users (for onboarding)
    - Use simpler checks that don't query users table within users policies

  3. New Policies
    - Users can insert their own record (for signup/onboarding)
    - Users can view their own record
    - Users can update their own record
    - Admins can view and manage users (using role check from auth metadata)

  4. Security Notes
    - INSERT is restricted to authenticated users creating their own record
    - Each user can only see and update their own data unless they're admin
    - Admin permissions are checked via organization membership
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their organization" ON users;

-- Allow authenticated users to insert their own user record (for onboarding)
CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can view their own record
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own record
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin users can view all users in their organization
-- Using a function to break the recursion
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = user_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE POLICY "Admins can view users in organization"
  ON users FOR SELECT
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND (
      organization_id = get_user_organization_id(auth.uid())
      OR get_user_role(auth.uid()) = 'super_admin'
    )
  );

CREATE POLICY "Admins can update users in organization"
  ON users FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND organization_id = get_user_organization_id(auth.uid())
  )
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND organization_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Admins can delete users in organization"
  ON users FOR DELETE
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND organization_id = get_user_organization_id(auth.uid())
  );
