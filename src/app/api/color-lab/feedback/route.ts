import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, rating, comment } = await req.json();

    if (!sessionId || !rating) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getDb();
    await db.query(
      "UPDATE color_lab_reports SET rating = $1, feedback_comment = $2 WHERE session_id = $3",
      [rating, comment || null, sessionId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
