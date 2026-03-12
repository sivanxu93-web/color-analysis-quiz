import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/libs/authOptions";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "SESSION_ID_REQUIRED" }, { status: 400 });
    }

    const db = getDb();

    // 1. Check if the session belongs to the user and hasn't been rewarded yet
    const sessionRes = await db.query(
        "SELECT shared_at FROM color_lab_sessions WHERE id = $1 AND email = $2",
        [sessionId, email]
    );

    if (sessionRes.rowCount === 0) {
        return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
    }

    if (sessionRes.rows[0].shared_at) {
        return NextResponse.json({ success: true, message: "ALREADY_REWARDED", creditsAdded: 0 });
    }

    // 2. Award +3 Validator Credits (P3-5 Growth Plan)
    await db.query("BEGIN");
    try {
        // Mark as shared
        await db.query(
            "UPDATE color_lab_sessions SET shared_at = now() WHERE id = $1",
            [sessionId]
        );

        // Get user_id
        const userRes = await db.query("SELECT user_id FROM user_info WHERE email = $1", [email]);
        const userId = userRes.rows[0]?.user_id;

        if (userId) {
            // Check if user has record in user_available
            const userAvailableRes = await db.query("SELECT id FROM user_available WHERE user_id = $1", [userId]);
            if (userAvailableRes.rowCount > 0) {
                // Update
                await db.query(`
                    UPDATE user_available 
                    SET validator_times = COALESCE(validator_times, 0) + 3,
                        updated_at = now()
                    WHERE user_id = $1
                `, [userId]);
            } else {
                // Insert
                await db.query(`
                    INSERT INTO user_available (user_id, validator_times) 
                    VALUES ($1, 3)
                `, [userId]);
            }
        }

        await db.query("COMMIT");
        return NextResponse.json({ success: true, creditsAdded: 3 });
    } catch (e) {
        await db.query("ROLLBACK");
        throw e;
    }

  } catch (error: any) {
    console.error("Share Reward Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
