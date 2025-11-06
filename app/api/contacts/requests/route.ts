import { listPendingRequests } from "@/backend/contact-action";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") ?? "incoming") as
      | "incoming"
      | "outgoing"
      | "all";

    const result = await listPendingRequests(type);
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
