import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, quizData } = body;

    if (!sessionId || !quizData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    
    await db.query(
      `UPDATE color_lab_sessions SET quiz_data = $1 WHERE id = $2`,
      [JSON.stringify(quizData), sessionId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving quiz data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
