-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view other users in their groups" ON public.users;

-- Create a simpler policy: users can view all other users
-- (We'll implement group-based privacy later if needed)
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);
