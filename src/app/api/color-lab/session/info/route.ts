import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const db = getDb();
    
    const res = await db.query(
      `SELECT s.id, s.status, s.email, r.season 
       FROM color_lab_sessions s
       LEFT JOIN color_lab_reports r ON s.id = r.session_id
       WHERE s.id = $1`,
      [sessionId]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const row = res.rows[0];

    return NextResponse.json({ 
        sessionId: row.id,
        status: row.status,
        email: row.email,
        hasReport: !!row.season
    });
  } catch (error: any) {
    console.error("Error fetching session info:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
