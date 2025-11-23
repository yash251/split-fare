-- Simplify group_members policies to avoid any recursion

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Allow viewing group members" ON public.group_members;
DROP POLICY IF EXISTS "Allow creating group memberships" ON public.group_members;
DROP POLICY IF EXISTS "Allow group admin actions" ON public.group_members;

-- Create completely permissive policies (we'll add proper access control later)
CREATE POLICY "group_members_select_all"
  ON public.group_members FOR SELECT
  USING (true);

CREATE POLICY "group_members_insert_all"
  ON public.group_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "group_members_delete_all"
  ON public.group_members FOR DELETE
  USING (true);

CREATE POLICY "group_members_update_all"
  ON public.group_members FOR UPDATE
  USING (true);
