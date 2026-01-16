import { NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    
    // Get featured reports
    // Prioritize showing the 'best_draping' image as the thumbnail
    const query = `
      SELECT 
        r.session_id,
        r.season,
        r.payload->>'headline' as headline,
        COALESCE(
            (SELECT url FROM color_lab_images WHERE session_id = r.session_id AND image_type = 'best_draping' LIMIT 1),
            (SELECT url FROM color_lab_images WHERE session_id = r.session_id AND image_type = 'user_upload' LIMIT 1)
        ) as image_url
      FROM color_lab_reports r
      WHERE r.is_featured = true
      ORDER BY r.created_at DESC
      LIMIT 6
    `;

    const result = await db.query(query);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Fetch featured error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
