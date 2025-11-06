import { NextResponse } from "next/server";
import { listFriends } from "@/backend/contact-action";

export async function GET() {
  try {
    const friends = await listFriends();
    return NextResponse.json(friends);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 400 },
    );
  }
}
