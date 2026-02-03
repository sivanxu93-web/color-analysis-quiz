import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userRes.rows[0].user_id;

    // 2. Check Credits
    const creditRes = await db.query("select available_times from user_available where user_id = $1", [userId]);
    let credits = 0;
    if (creditRes.rows.length > 0) {
        credits = creditRes.rows[0].available_times;
    }

    if (credits <= 0) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // 3. Deduct Credit
    await db.query("update user_available set available_times = available_times - 1 where user_id = $1", [userId]);
    
    // 4. Log Transaction
    await db.query("insert into credit_logs(user_id, amount, type, description) values($1, -1, 'usage', $2)", [userId, `Unlock Report: ${sessionId}`]);

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
