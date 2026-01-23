import { NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  
  try {
      const totalUsers = (await db.query("SELECT count(*) FROM user_info")).rows[0].count;
      const totalSessions = (await db.query("SELECT count(*) FROM color_lab_sessions")).rows[0].count;
      const analyzedSessions = (await db.query("SELECT count(*) FROM color_lab_sessions WHERE status = 'analyzed'")).rows[0].count;
      
      const totalRatings = (await db.query("SELECT count(*) FROM color_lab_reports WHERE rating IS NOT NULL")).rows[0].count;
      const goodRatings = (await db.query("SELECT count(*) FROM color_lab_reports WHERE rating = 'good'")).rows[0].count;
      
      const retentionRes = await db.query(`
        SELECT count(*) as count FROM (
            SELECT email FROM color_lab_sessions 
            WHERE status='analyzed' AND email IS NOT NULL
            GROUP BY email 
            HAVING count(*) > 1
        ) as repeats
      `);
      const repeatUsers = retentionRes.rows[0].count;

      return NextResponse.json({
          totalUsers,
          totalSessions,
          analyzedSessions,
          totalRatings,
          goodRatings,
          repeatUsers
      });
  } catch (e: any) {
      return NextResponse.json({ error: e.message });
  }
}
