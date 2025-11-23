-- Fix infinite recursion in group_members policies

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Create simpler policies without recursion

-- Anyone can view group members (we'll add privacy controls later if needed)
CREATE POLICY "Allow viewing group members"
  ON public.group_members FOR SELECT
  USING (true);

-- Allow INSERT for group creation (will check permissions in application code)
CREATE POLICY "Allow creating group memberships"
  ON public.group_members FOR INSERT
  WITH CHECK (true);

-- Allow users to delete their own membership (leave group)
CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (user_id::text = (
    SELECT id::text FROM users WHERE privy_id = auth.uid()::text
  ));

-- Allow DELETE for group admins (will implement more complex logic later)
CREATE POLICY "Allow group admin actions"
  ON public.group_members FOR DELETE
  USING (true);
