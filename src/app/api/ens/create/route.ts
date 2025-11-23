
import { NextRequest, NextResponse } from "next/server";
import { createENSSubdomain } from "@/lib/namespace/client";

export async function POST(request: NextRequest) {
  try {
    const { username, walletAddress } = await request.json();

    if (!username || !walletAddress) {
      return NextResponse.json(
        { error: "Username and wallet address are required" },
        { status: 400 }
      );
    }

    const result = await createENSSubdomain({
      username,
      walletAddress,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ensName: result.ensName,
    });
  } catch (error: any) {
    console.error("ENS creation API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
