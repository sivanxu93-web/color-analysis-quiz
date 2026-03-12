import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { R2, r2Bucket, storageURL } from "~/libs/R2";
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

    const { sessionId, imageData } = await req.json();

    if (!sessionId || !imageData) {
      return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
    }

    const db = getDb();

    // 1. Verify Ownership
    const sessionRes = await db.query(
        "SELECT id FROM color_lab_sessions WHERE id = $1 AND email = $2",
        [sessionId, email]
    );

    if (sessionRes.rowCount === 0) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // 2. Ensure column exists (one-time check/fix)
    await db.query(`ALTER TABLE color_lab_reports ADD COLUMN IF NOT EXISTS share_card_url varchar;`);

    // 3. Process Base64 Image
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `share-cards/${sessionId}.png`;

    // 4. Upload to R2
    await R2.putObject({
        Bucket: r2Bucket!,
        Key: fileName,
        Body: buffer,
        ContentType: 'image/png',
        ACL: 'public-read'
    }).promise();

    const fullUrl = `${storageURL}/${fileName}`;

    // 5. Update Database
    await db.query(
        "UPDATE color_lab_reports SET share_card_url = $1 WHERE session_id = $2",
        [fullUrl, sessionId]
    );

    return NextResponse.json({ success: true, url: fullUrl });

  } catch (error: any) {
    console.error("Share Card Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
