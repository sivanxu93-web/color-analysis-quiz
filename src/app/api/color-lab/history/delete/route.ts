import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { deleteColorLabSession } from "~/servers/colorLab";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, email } = body;

    if (!sessionId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call server function to delete
    await deleteColorLabSession(sessionId, email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
