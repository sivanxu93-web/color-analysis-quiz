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
    const { filename, contentType, sessionId } = body;

    if (!filename || !contentType || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fileExtension = filename.split('.').pop();
    const key = `color-lab/${sessionId}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: r2Bucket,
      Key: key,
      ContentType: contentType,
      Expires: 600, // 10 minutes
    };

    const uploadUrl = await R2.getSignedUrlPromise('putObject', params);
    
    // Save image record to DB
    const db = getDb();
    const publicUrl = `${process.env.NEXT_PUBLIC_STORAGE_URL}/${key}`;

    await db.query(
        "insert into color_lab_images(session_id, url, image_type) values($1, $2, $3)",
        [sessionId, publicUrl, 'user_upload']
    );

    // Create Draft Report Immediately
    await saveColorLabReport(
        sessionId,
        null,
        null,
        'draft',
        publicUrl
    );

    return NextResponse.json({ uploadUrl, key, publicUrl });

  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}