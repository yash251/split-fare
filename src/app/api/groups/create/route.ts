import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { name, description, privyId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
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

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        description: description || null,
        currency: "USDC",
        created_by: userData.id,
      })
      .select()
      .single();

    if (groupError) {
      console.error("Error creating group:", groupError);
      return NextResponse.json(
        { error: "Failed to create group" },
        { status: 500 }
      );
    }

    // Add creator as admin member
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: userData.id,
      role: "admin",
    });

    if (memberError) {
      console.error("Error adding group member:", memberError);
      // Rollback group creation
      await supabase.from("groups").delete().eq("id", group.id);
      return NextResponse.json(
        { error: "Failed to add you as group member" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error: any) {
    console.error("Group creation API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
