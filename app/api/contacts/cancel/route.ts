import { NextResponse } from "next/server";
import { cancelFriendRequest } from "@/backend/contact-action";

export async function POST(req: Request) {
  try {
    const { friendshipId } = await req.json();
    const result = await cancelFriendRequest(friendshipId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
