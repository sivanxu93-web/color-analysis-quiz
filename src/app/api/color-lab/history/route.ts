import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = getDb();

    // Query sessions that have a completed report
    // We join with color_lab_reports to ensure the analysis is actually done
    // We left join with color_lab_images to get the user upload thumbnail
    const query = `
      SELECT 
        s.id as session_id,
        s.created_at,
        r.season,
        r.payload->>'headline' as headline,
        i.url as image_url
      FROM color_lab_sessions s
      JOIN color_lab_reports r ON s.id = r.session_id
      LEFT JOIN color_lab_images i ON s.id = i.session_id AND (i.image_type = 'user_upload' OR i.image_type IS NULL)
      WHERE s.email = $1
      ORDER BY s.created_at DESC
      LIMIT 50
    `;

    const result = await db.query(query, [email]);

    return NextResponse.json({ 
        success: true, 
        data: result.rows 
    });

  } catch (error: any) {
    console.error("Fetch history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
