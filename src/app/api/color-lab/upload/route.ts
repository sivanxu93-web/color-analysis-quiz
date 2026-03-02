import { NextRequest, NextResponse } from "next/server";
import { R2, r2Bucket } from "~/libs/R2";
import { v4 as uuidv4 } from 'uuid';
import { getDb } from "~/libs/db";
import { saveColorLabReport } from "~/servers/colorLab";

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
        body = await req.json();
    } catch(e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { filename, contentType, sessionId, imageHash, type } = body;

    if (!filename || !contentType || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const isOutfit = type === 'outfits';

    // 1. Check for Duplicate / Existing Hash (Skip for outfits)
    if (imageHash && !isOutfit) {
        const existingRes = await db.query(
            `SELECT input_image_url FROM color_lab_reports 
             WHERE image_hash = $1 AND status = 'completed' AND input_image_url IS NOT NULL 
             ORDER BY created_at DESC LIMIT 1`,
            [imageHash]
        );

        if (existingRes.rows.length > 0) {
            const reusedUrl = existingRes.rows[0].input_image_url;
            console.log(`Image Hash Hit! Reusing image URL: ${reusedUrl}`);

            // Link the existing image record to the new session
            await db.query(
                "insert into color_lab_images(session_id, url, image_type) values($1, $2, $3)",
                [sessionId, reusedUrl, 'user_upload']
            );

            // Create a NEW Draft Report (even though image exists, we want a fresh analysis)
            await saveColorLabReport(
                sessionId,
                null,
                null,
                'draft',
                reusedUrl,
                imageHash
            );

            return NextResponse.json({ 
                reused: true, 
                publicUrl: reusedUrl 
            });
        }
    }

    // 2. No Hit - Proceed to Upload
    const fileExtension = filename.split('.').pop();
    const key = isOutfit 
        ? `color-lab/outfits/${sessionId}/${uuidv4()}.${fileExtension}`
        : `color-lab/${sessionId}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: r2Bucket,
      Key: key,
      ContentType: contentType,
      Expires: 600, // 10 minutes
    };

    const uploadUrl = await R2.getSignedUrlPromise('putObject', params);
    const publicUrl = `${process.env.NEXT_PUBLIC_STORAGE_URL}/${key}`;

    // Only create session-related DB records if this is a main analysis photo
    if (!isOutfit) {
        await db.query(
            "insert into color_lab_images(session_id, url, image_type) values($1, $2, $3)",
            [sessionId, publicUrl, 'user_upload']
        );

        // Create Draft Report Immediately (with Hash)
        await saveColorLabReport(
            sessionId,
            null,
            null,
            'draft',
            publicUrl,
            imageHash || null
        );
    }

    return NextResponse.json({ uploadUrl, key, publicUrl });

  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}