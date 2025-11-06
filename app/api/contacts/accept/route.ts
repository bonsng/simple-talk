import { NextResponse } from "next/server";
import { acceptFriendRequest } from "@/backend/contact-action";

export async function POST(req: Request) {
  try {
    const { friendshipId } = await req.json();
    const result = await acceptFriendRequest(friendshipId);
    return NextResponse.json(result);
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
