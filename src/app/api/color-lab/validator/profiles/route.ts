import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/libs/authOptions";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Fetch all completed/analyzed sessions for this user
    const sessionRes = await db.query(`
        SELECT s.id, r.season, r.payload->>'headline' as headline, i.url as image_url 
        FROM color_lab_sessions s
        JOIN color_lab_reports r ON s.id = r.session_id
        LEFT JOIN color_lab_images i ON s.id = i.session_id AND i.image_type = 'user_upload'
        WHERE s.email = $1 AND s.status IN ('completed', 'analyzed') 
        ORDER BY s.created_at DESC
    `, [email]);

    return NextResponse.json({ 
        success: true, 
        profiles: sessionRes.rows 
    });

  } catch (error: any) {
    console.error("Fetch Profiles Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
