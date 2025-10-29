import { NextResponse } from "next/server";
import { listPendingRequests } from "@/backend/contact-action";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") ?? "incoming") as
      | "incoming"
      | "outgoing"
      | "all";

    const result = await listPendingRequests(type);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
