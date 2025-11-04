import { requireUserId } from "@/backend/account-action";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ id: userId.trim() });
  } catch (error) {
    console.error("Failed to get user ID:", error);
    return NextResponse.json(
      { error: "Failed to get user info" },
      { status: 500 },
    );
  }
}
