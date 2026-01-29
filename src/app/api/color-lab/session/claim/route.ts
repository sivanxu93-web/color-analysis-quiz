import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, email } = body;

    if (!sessionId || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getDb();
    
    // Link the session to the user's email
    // Only update if it's currently null or different? 
    // Just update it to be safe.
    await db.query(
      "UPDATE color_lab_sessions SET email = $1 WHERE id = $2",
      [email, sessionId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Session Claim Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
