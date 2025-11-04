import { NextResponse } from "next/server";
import { getConversationHeader } from "@/backend/chat-action";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("cid");
  if (!conversationId)
    return NextResponse.json({ error: "Missing user" }, { status: 400 });

  const conversationHeader = await getConversationHeader(
    Number(conversationId),
  );
  return NextResponse.json(conversationHeader);
}
