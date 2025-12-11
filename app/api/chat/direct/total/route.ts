import { NextResponse } from "next/server";
import { getMessagePageMeta } from "@/backend/chat-action";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cid = Number(searchParams.get("cid"));

  if (!cid || Number.isNaN(cid)) {
    return NextResponse.json({ error: "Invalid cid" }, { status: 400 });
  }

  const data = await getMessagePageMeta(cid);
  if (!data) throw new Error("Failed to fetch message page meta.");

  return NextResponse.json(data);
}
