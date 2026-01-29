import { NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  try {
    // 1. Find sessions that have email but NO report record
    // These are the "legacy" abandoned users
    const query = `
      SELECT 
        s.id as session_id,
        s.email,
        (SELECT url FROM color_lab_images WHERE session_id = s.id LIMIT 1) as image_url
      FROM color_lab_sessions s
      LEFT JOIN color_lab_reports r ON s.id = r.session_id
      WHERE s.email IS NOT NULL 
        AND s.status != 'analyzed'
        AND r.session_id IS NULL
      LIMIT 100;
    `;

    const result = await db.query(query);
    const sessionsToBackfill = result.rows;

    console.log(`Found ${sessionsToBackfill.length} legacy sessions to backfill.`);

    let createdCount = 0;

    // 2. Insert Draft Reports for them
    for (const session of sessionsToBackfill) {
      if (session.image_url) {
          await db.query(
            `INSERT INTO color_lab_reports(session_id, status, input_image_url, created_at)
             VALUES($1, 'draft', $2, now())
             ON CONFLICT (session_id) DO NOTHING`,
            [session.session_id, session.image_url]
          );
          createdCount++;
      } else {
          console.warn(`Skipping session ${session.session_id} - No image found.`);
      }
    }

    return NextResponse.json({ 
        success: true, 
        found: sessionsToBackfill.length, 
        created_drafts: createdCount,
        message: "Legacy sessions have been backfilled with draft reports. Now run the recovery cron." 
    });

  } catch (error: any) {
    console.error("Backfill Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
