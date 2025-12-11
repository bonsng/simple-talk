import { NextResponse } from "next/server";
import { listMessages, sendTextMessage } from "@/backend/chat-action";

export async function POST(req: Request) {
  const { conversationId, body } = await req.json();

  const cid = Number(conversationId);
  if (!cid || Number.isNaN(cid))
    return NextResponse.json(
      { error: "Invalid conversationId" },
      { status: 400 },
    );

  if (!body?.trim())
    return NextResponse.json(
      { error: "Message body required" },
      { status: 400 },
    );

  const result = await sendTextMessage(cid, body);

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cid = Number(searchParams.get("cid"));
  const totalPage = Number(searchParams.get("total"));
  const pageNumber = Number(searchParams.get("page"));
  const totalCount = Number(searchParams.get("count"));
  if (!cid || Number.isNaN(cid)) {
    return NextResponse.json({ error: "Invalid cid" }, { status: 400 });
  }

  const data = await listMessages(cid, {
    totalPages: totalPage,
    page: pageNumber,
    totalCount,
  });

  if (!data) throw new Error("failed to fetch messages");

  return NextResponse.json(data);
}
