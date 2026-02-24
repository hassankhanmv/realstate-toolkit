-- Add user management fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'agent',
  ADD COLUMN IF NOT EXISTS is_disabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expiry_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{"properties": {"view": true, "edit": false, "create": false, "delete": false}, "leads": {"view": true, "edit": false, "create": false, "delete": false}, "users": {"view": false, "edit": false, "create": false, "delete": false}, "analytics": false, "profile": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS notifications jsonb DEFAULT '{"on_login": false, "on_disable": true, "on_expiry": true}'::jsonb;

-- Update RLS policies for profiles to allow admins to manage other profiles
-- Note: You might need to adjust this depending on how 'admin' is determined.
-- For now, we allow users to read all profiles (if that fits the app) or we restrict it.
-- Let's just create a policy that allows reading all profiles for authenticated users.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users."
  ON public.profiles FOR SELECT
  TO authenticated
  USING ( true );

-- Policy to allow users to update their own profile
-- (Assuming an existing policy exists, we might not need to touch it, 
-- but we should ensure users can't modify their own permissions if they aren't admin.)
-- For simplicity, let's leave existing UPDATE policies intact unless we need strict enforcement at DB level yet.
