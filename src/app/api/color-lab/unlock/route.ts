import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { deductUserCredits } from "~/servers/manageUserTimes";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, email } = await req.json();

    if (!sessionId || !email) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const db = getDb();

    // 1. Get User ID
    const userRes = await db.query(
      "select user_id from user_info where email = $1",
      [email]
    );
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found. Please login." }, { status: 404 });
    }
    const userId = userRes.rows[0].user_id;

    // 2 & 3. Deduct 40 Credits using prioritized logic
    const hasCredits = await deductUserCredits(userId, 40);
    if (!hasCredits) {
        return NextResponse.json({ error: "Insufficient credits to unlock the professional report." }, { status: 402 });
    }
    
    // 4. Log Transaction
    await db.query("insert into credit_logs(user_id, amount, type, description) values($1, -40, 'usage', $2)", [userId, `Unlock Report: ${sessionId}`]);

    // 5. Update Session Status to 'completed'
    await db.query("update color_lab_sessions set status = 'completed' where id = $1", [sessionId]);

    // 6. Also update report status if necessary (some legacy logic might use report status column)
    await db.query("update color_lab_reports set status = 'completed' where session_id = $1", [sessionId]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Unlock Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
