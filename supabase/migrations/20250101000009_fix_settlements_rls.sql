-- Fix settlements RLS policies to match other tables
-- Since we use Privy auth (not Supabase auth), auth.uid() returns null
-- All other tables use permissive policies, so settlements should too

-- Drop existing settlements policies
DROP POLICY IF EXISTS "settlements_select" ON settlements;
DROP POLICY IF EXISTS "settlements_insert" ON settlements;
DROP POLICY IF EXISTS "settlements_update" ON settlements;

-- Create permissive policies for settlements (matching other tables)
CREATE POLICY "settlements_select"
  ON settlements FOR SELECT
  USING (true);

CREATE POLICY "settlements_insert"
  ON settlements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "settlements_update"
  ON settlements FOR UPDATE
  USING (true);
