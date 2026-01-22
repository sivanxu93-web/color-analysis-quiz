import { NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    // Count analyzed sessions or reports
    const result = await db.query("SELECT count(*) as count FROM color_lab_reports");
    const count = parseInt(result.rows[0].count, 10);

    // Fetch latest 3 user avatars
    const avatarsRes = await db.query(`
        SELECT image 
        FROM user_info 
        WHERE image IS NOT NULL 
        AND length(image) > 10
        ORDER BY created_at DESC 
        LIMIT 3
    `);
    const avatars = avatarsRes.rows.map(row => row.image);
    
    return NextResponse.json({ count, avatars });
  } catch (error) {
    console.error("Stats error", error);
    return NextResponse.json({ count: 0 });
  }
}
