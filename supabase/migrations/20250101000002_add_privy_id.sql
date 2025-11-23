-- Add privy_id column to store Privy's DID
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privy_id TEXT UNIQUE;

-- Update RLS policies to check privy_id instead of id
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (privy_id = auth.uid()::text OR id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (privy_id = auth.uid()::text OR id::text = auth.uid()::text);

-- Add INSERT policy for new user registration
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
CREATE POLICY "Users can create their own profile"
  ON public.users FOR INSERT
  WITH CHECK (true);
