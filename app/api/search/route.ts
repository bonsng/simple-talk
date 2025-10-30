import { NextResponse } from "next/server";
import { searchUsersByName } from "@/backend/account-action";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");

    const result = await searchUsersByName(term);
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
