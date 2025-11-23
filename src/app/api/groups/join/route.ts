import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { groupId, privyId } = await request.json();

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    if (!privyId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
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

    // Check if group exists
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("id, name")
      .eq("id", groupId)
      .single();

    if (groupError || !groupData) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userData.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this group", alreadyMember: true },
        { status: 400 }
      );
    }

    // Add user as a member
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: userData.id,
      role: "member",
    });

    if (memberError) {
      console.error("Error adding group member:", memberError);
      return NextResponse.json(
        { error: "Failed to join group" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      group: groupData,
    });
  } catch (error: any) {
    console.error("Join group API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
