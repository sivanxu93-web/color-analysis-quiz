import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/libs/authOptions";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, sessionId } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const db = getDb();

    // 1. Verify if the user has an existing completed report
    let actualSessionId = sessionId;
    if (!actualSessionId) {
        // Try to find completed sessions for this user
        const sessionRes = await db.query(`
            SELECT s.id, r.season, r.payload->>'headline' as headline, i.url as image_url
            FROM color_lab_sessions s
            JOIN color_lab_reports r ON s.id = r.session_id
            LEFT JOIN color_lab_images i ON s.id = i.session_id AND i.image_type = 'original'
            WHERE s.email = $1 AND s.status IN ('completed', 'analyzed') 
            ORDER BY s.created_at DESC
        `, [email]);

        if (sessionRes.rowCount === 0) {
            return NextResponse.json({ error: "NO_REPORT_FOUND", message: "You must complete a color analysis before using the validator." }, { status: 403 });
        } else if (sessionRes.rowCount === 1) {
            // Only one report, use it automatically
            actualSessionId = sessionRes.rows[0].id;
        } else {
            // Multiple reports found, and client didn't specify which one.
            // Return the list so the client can prompt the user.
            return NextResponse.json({ 
                error: "MULTIPLE_REPORTS_FOUND", 
                message: "Please select which profile to use.",
                profiles: sessionRes.rows 
            }, { status: 400 });
        }
    }

    // 1.5 Get User ID
    const userRes = await db.query("SELECT user_id FROM user_info WHERE email = $1", [email]);
    const userId = userRes.rows[0]?.user_id;

    if (!userId) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // 1.6 Check Credits (Validator Times)
    const creditRes = await db.query("SELECT validator_times FROM user_available WHERE user_id = $1", [userId]);
    const validatorTimes = creditRes.rows[0]?.validator_times || 0;

    // Fallback for existing users who bought a report before validator_times existed
    const countRes = await db.query(
        "SELECT COUNT(*) as count FROM color_lab_outfits WHERE email = $1",
        [email]
    );
    const usageCount = parseInt(countRes.rows[0].count, 10);
    const hasLegacyFreeAccess = usageCount < 3;

    if (validatorTimes <= 0 && !hasLegacyFreeAccess) {
        return NextResponse.json({ 
            error: "LIMIT_REACHED", 
            message: "Your AI Stylist needs a top-up. Get more scans to never buy the wrong color again!" 
        }, { status: 402 }); // 402 Payment Required
    }

    // Deduct 1 credit if they are using their paid/gifted balance
    if (validatorTimes > 0) {
        await db.query("UPDATE user_available SET validator_times = validator_times - 1 WHERE user_id = $1", [userId]);
    }

    // 2. Create the outfit record
    const insertRes = await db.query(
        "INSERT INTO color_lab_outfits (session_id, email, image_url, status) VALUES ($1, $2, $3, 'created') RETURNING id",
        [actualSessionId, email, imageUrl]
    );

    const outfitId = insertRes.rows[0].id;

    return NextResponse.json({ 
        success: true, 
        outfitId: outfitId,
        sessionId: actualSessionId
    });

  } catch (error: any) {
    console.error("Validator Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
