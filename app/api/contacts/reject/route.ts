import { NextResponse } from "next/server";
import { rejectFriendRequest } from "@/backend/contact-action";

export async function POST(req: Request) {
  try {
    const { friendshipId } = await req.json();
    const result = await rejectFriendRequest(friendshipId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 400 },
    );
  }
}
