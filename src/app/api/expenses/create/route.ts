import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { groupId, description, amount, paidBy, privyId } = await request.json();

    if (!groupId || !description || !amount || !paidBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!privyId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user ID from Privy ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("privy_id", privyId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get all group members to split the expense
    const { data: membersData, error: membersError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (membersError || !membersData || membersData.length === 0) {
      return NextResponse.json(
        { error: "Failed to get group members" },
        { status: 500 }
      );
    }

    // Create the expense
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        group_id: groupId,
        description,
        amount,
        currency: "USDC",
        paid_by: paidBy,
        created_by: userData.id,
      })
      .select()
      .single();

    if (expenseError) {
      console.error("Error creating expense:", expenseError);
      return NextResponse.json(
        { error: "Failed to create expense" },
        { status: 500 }
      );
    }

    // Calculate split amount (equal split)
    const splitAmount = amount / membersData.length;

    // Create expense splits for all members
    const splits = membersData.map((member) => ({
      expense_id: expense.id,
      user_id: member.user_id,
      amount: splitAmount,
    }));

    const { error: splitsError } = await supabase
      .from("expense_splits")
      .insert(splits);

    if (splitsError) {
      console.error("Error creating expense splits:", splitsError);
      // Rollback expense creation
      await supabase.from("expenses").delete().eq("id", expense.id);
      return NextResponse.json(
        { error: "Failed to create expense splits" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expense,
    });
  } catch (error: any) {
    console.error("Create expense API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
