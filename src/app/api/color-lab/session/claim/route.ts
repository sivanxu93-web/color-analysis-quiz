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
    
    // Security Fix: Only claim sessions that have NO owner (email is null).
    // Prevent overwriting existing owners (hijacking).
    const result = await db.query(
      "UPDATE color_lab_sessions SET email = $1 WHERE id = $2 AND email IS NULL",
      [email, sessionId]
    );
    
    // If no rows updated, it means either:
    // 1. Session doesn't exist
    // 2. Session already has an owner
    // In either case, we don't want to throw an error (idempotent), but we definitely didn't steal it.
    
    return NextResponse.json({ success: true, claimed: result.rowCount > 0 });
  } catch (error: any) {
    console.error("Session Claim Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
