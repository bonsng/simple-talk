import { NextResponse } from "next/server";
import { sendFriendRequest } from "@/backend/contact-action";
import { getUserByName } from "@/backend/account-action";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const toUserId = await getUserByName(name);

    const result = await sendFriendRequest(toUserId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 400 },
    );
  }
}
