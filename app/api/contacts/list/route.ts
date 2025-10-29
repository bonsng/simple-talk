import { NextResponse } from "next/server";
import { listFriends } from "@/backend/contact-action";

export async function GET() {
  try {
    const friends = await listFriends();
    return NextResponse.json(friends);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
