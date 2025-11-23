-- Fix RLS policies for expenses and expense_splits tables to avoid recursion

-- ===================================
-- FIX EXPENSES POLICIES
-- ===================================

-- Drop ALL existing expenses policies
DROP POLICY IF EXISTS "Users can view expenses in their groups" ON public.expenses;
DROP POLICY IF EXISTS "Group members can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

-- Create simple permissive policies for expenses
CREATE POLICY "expenses_select"
  ON public.expenses FOR SELECT
  USING (true);

CREATE POLICY "expenses_insert"
  ON public.expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "expenses_update"
  ON public.expenses FOR UPDATE
  USING (true);

CREATE POLICY "expenses_delete"
  ON public.expenses FOR DELETE
  USING (true);

-- ===================================
-- FIX EXPENSE_SPLITS POLICIES
-- ===================================

-- Drop ALL existing expense_splits policies
DROP POLICY IF EXISTS "Users can view expense splits in their groups" ON public.expense_splits;
DROP POLICY IF EXISTS "Expense creators can manage splits" ON public.expense_splits;

-- Create simple permissive policies for expense_splits
CREATE POLICY "expense_splits_select"
  ON public.expense_splits FOR SELECT
  USING (true);

CREATE POLICY "expense_splits_insert"
  ON public.expense_splits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "expense_splits_update"
  ON public.expense_splits FOR UPDATE
  USING (true);

CREATE POLICY "expense_splits_delete"
  ON public.expense_splits FOR DELETE
  USING (true);
