-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view other users in their groups"
  ON public.users FOR SELECT
  USING (
    id IN (
      SELECT gm.user_id
      FROM public.group_members gm
      WHERE gm.group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Groups table policies
CREATE POLICY "Users can view groups they are members of"
  ON public.groups FOR SELECT
  USING (
    id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Group admins can update their groups"
  ON public.groups FOR UPDATE
  USING (
    id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can delete their groups"
  ON public.groups FOR DELETE
  USING (
    id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Group members table policies
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can add members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can remove members"
  ON public.group_members FOR DELETE
  USING (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- Expenses table policies
CREATE POLICY "Users can view expenses in their groups"
  ON public.expenses FOR SELECT
  USING (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own expenses"
  ON public.expenses FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own expenses"
  ON public.expenses FOR DELETE
  USING (created_by = auth.uid());

-- Expense splits table policies
CREATE POLICY "Users can view expense splits in their groups"
  ON public.expense_splits FOR SELECT
  USING (
    expense_id IN (
      SELECT id
      FROM public.expenses
      WHERE group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Expense creators can manage splits"
  ON public.expense_splits FOR ALL
  USING (
    expense_id IN (
      SELECT id
      FROM public.expenses
      WHERE created_by = auth.uid()
    )
  );

-- Settlements table policies
CREATE POLICY "Users can view settlements in their groups"
  ON public.settlements FOR SELECT
  USING (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create settlements they are part of"
  ON public.settlements FOR INSERT
  WITH CHECK (
    from_user = auth.uid()
    AND group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own settlements"
  ON public.settlements FOR UPDATE
  USING (from_user = auth.uid());

-- Group invites table policies
CREATE POLICY "Anyone can view valid invites"
  ON public.group_invites FOR SELECT
  USING (
    (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses_count < max_uses)
  );

CREATE POLICY "Group admins can create invites"
  ON public.group_invites FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can delete invites"
  ON public.group_invites FOR DELETE
  USING (
    group_id IN (
      SELECT group_id
      FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
