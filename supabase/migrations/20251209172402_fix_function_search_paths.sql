/*
  # Fix Function Search Paths

  1. Security Enhancement
    - Fix mutable search_path for functions `make_user_admin` and `make_user_super_admin`
    - Add explicit `search_path` configuration to prevent schema injection attacks
    - Set `search_path` to 'public' for these functions

  2. Functions Updated
    - make_user_admin
    - make_user_super_admin
*/

-- Drop and recreate make_user_admin with fixed search_path
DROP FUNCTION IF EXISTS public.make_user_admin(uuid);
CREATE OR REPLACE FUNCTION public.make_user_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can make users admins
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can promote users to admin';
  END IF;

  UPDATE public.users
  SET role = 'admin'
  WHERE id = target_user_id;
END;
$$;

-- Drop and recreate make_user_super_admin with fixed search_path
DROP FUNCTION IF EXISTS public.make_user_super_admin(uuid);
CREATE OR REPLACE FUNCTION public.make_user_super_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing super admins can make other users super admins
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can promote users to super admin';
  END IF;

  UPDATE public.users
  SET role = 'super_admin'
  WHERE id = target_user_id;
END;
$$;
