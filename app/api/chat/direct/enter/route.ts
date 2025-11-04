import { NextResponse } from "next/server";
import { getOrCreateDirectConversation } from "@/backend/chat-action";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const otherId = searchParams.get("user");
  if (!otherId)
    return NextResponse.json({ error: "Missing user" }, { status: 400 });

  const cid = await getOrCreateDirectConversation(otherId);
  return NextResponse.json({ id: cid });
}
