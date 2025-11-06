// app/api/chat/list/route.ts
import { NextResponse } from "next/server";
import { listMyDirectChats } from "@/backend/chat-action";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 30);
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    const rows = await listMyDirectChats({ limit, offset });
    return NextResponse.json({ items: rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to list conversations";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
