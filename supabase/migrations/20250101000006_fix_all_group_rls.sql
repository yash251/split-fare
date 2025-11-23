-- Fix RLS policies for both groups and group_members tables

-- ===================================
-- FIX GROUP_MEMBERS POLICIES
-- ===================================

-- Drop ALL existing group_members policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Allow viewing group members" ON public.group_members;
DROP POLICY IF EXISTS "Allow creating group memberships" ON public.group_members;
DROP POLICY IF EXISTS "Allow group admin actions" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_all" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert_all" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete_all" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update_all" ON public.group_members;

-- Create simple permissive policies for group_members
CREATE POLICY "group_members_select"
  ON public.group_members FOR SELECT
  USING (true);

CREATE POLICY "group_members_insert"
  ON public.group_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "group_members_delete"
  ON public.group_members FOR DELETE
  USING (true);

CREATE POLICY "group_members_update"
  ON public.group_members FOR UPDATE
  USING (true);

-- ===================================
-- FIX GROUPS POLICIES
-- ===================================

-- Drop ALL existing groups policies
DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;

-- Create simple permissive policies for groups
CREATE POLICY "groups_select"
  ON public.groups FOR SELECT
  USING (true);

CREATE POLICY "groups_insert"
  ON public.groups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "groups_update"
  ON public.groups FOR UPDATE
  USING (true);

CREATE POLICY "groups_delete"
  ON public.groups FOR DELETE
  USING (true);
