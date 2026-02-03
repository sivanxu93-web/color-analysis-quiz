import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { R2, r2Bucket, storageDomain } from "~/libs/R2";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { sessionId, prompt, type, makeup_prompt } = body; // type: 'best' or 'worst'

    if (!sessionId || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Default makeup instructions if not provided by the analyze step
    const defaultMakeup =
      type === "best"
        ? "Apply an ultra-realistic, 'No-Makeup' makeup look. Use a sheer, hydrating lip tint and subtle blush that harmonizes with the skin. Maintain skin texture and avoid any heavy application."
        : "Apply a natural makeup look, but use colors that slightly clash with the skin's undertone. The application must remain light and sheer, showing how the wrong undertone makes the skin look duller without using heavy makeup textures.";

    const makeupInstruction = makeup_prompt || defaultMakeup;

    // 1. Get User Image from DB
    const db = getDb();

    // SECURITY CHECK: Verify session status is 'completed' (Paid)
    const sessionRes = await db.query(
      "select status from color_lab_sessions where id = $1",
      [sessionId]
    );

    if (sessionRes.rowCount === 0) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (sessionRes.rows[0].status !== 'completed') {
        console.warn(`Blocked draping attempt for unpaid session: ${sessionId}`);
        return NextResponse.json(
            { error: "Payment required to unlock virtual draping." }, 
            { status: 403 }
        );
    }

    // CHECK CACHE: Check if draping image already exists
    const imageType = type === "best" ? "best_draping" : "worst_draping";
    const existingRes = await db.query(
      "select url from color_lab_images where session_id = $1 and image_type = $2 limit 1",
      [sessionId, imageType],
    );

    if (existingRes.rowCount > 0) {
      console.log(`Image (${type}) already exists, returning cached URL.`);
      return NextResponse.json({
        success: true,
        imageUrl: existingRes.rows[0].url,
      });
    }

    const imageRes = await db.query(
      "select url from color_lab_images where session_id = $1 and (image_type = 'user_upload' or image_type is null) limit 1",
      [sessionId],
    );

    if (imageRes.rowCount === 0) {
      return NextResponse.json(
        { error: "User image not found" },
        { status: 404 },
      );
    }
    const userImageUrl = imageRes.rows[0].url;

    // 2. Fetch User Image and convert to Base64
    const fetchUrl = userImageUrl.startsWith("http")
      ? userImageUrl
      : `https://${storageDomain}/${userImageUrl}`;

    console.log(`Fetching user image from: ${fetchUrl}`);
    const imgResponse = await fetch(fetchUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch user image: ${imgResponse.statusText}`);
    }
    const imgArrayBuffer = await imgResponse.arrayBuffer();
    const imgBase64 = Buffer.from(imgArrayBuffer).toString("base64");
    const imgMimeType = imgResponse.headers.get("content-type") || "image/jpeg";

    // 3. Initialize Gemini with the specific model
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Using gemini-3-pro-image-preview which supports image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-image-preview",
    });

    const fullPrompt = `STRICT IMAGE EDITING INSTRUCTION FOR 'COLOR ANALYSIS QUIZ'.
    
    TASK: Change the color of the user's clothing to "${prompt}".
    
    CONSTRAINTS (NON-NEGOTIABLE):
    1. 🖼️ IDENTITY LOCK: Keep the user's face, expression, smile, and eyes EXACTLY as they are in the original photo. Do not retouch features.
    2. 👗 GARMENT ONLY: Change ONLY the color of the clothing the person is currently wearing. Do not add clothes, do not add blankets or "grey cloths".
    3. 🎨 TEXTURE PRESERVATION: Keep the original fabric texture, folds, and shadows. The clothing should look like the same shirt but dyed a different color.
    4. 🌆 BACKGROUND LOCK: Keep the background 100% identical to the original image.
    5. 💄 MAKEUP: ${makeupInstruction}
    
    STYLE: Professional, photorealistic studio result. NO filters. NO AI-generated faces.
    
    FINAL COMMAND: "Modify only the clothing to ${prompt} and apply the specified subtle makeup. Everything else must remain pixel-perfect identical to the original."`;


    console.log(`Calling Gemini (${type})...`);
    console.time(`Gemini-Gen-${type}`);

    let response;
    try {
      const result = await model.generateContent([
        fullPrompt,
        {
          inlineData: {
            data: imgBase64,
            mimeType: imgMimeType,
          },
        },
      ]);
      response = await result.response;
    } catch (geminiError: any) {
      console.error("Gemini API Technical Error:", geminiError);
      // Bragging about high volume while masking the technical error
      throw new Error("Wow! We're experiencing overwhelming demand from our global community. Our AI stylists are working at maximum capacity—please give us a few seconds and try again!");
    }
    console.timeEnd(`Gemini-Gen-${type}`);

    // 4. Extract Image from Response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    const content = candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      console.error("Gemini Empty Response:", JSON.stringify(candidates));
      throw new Error("Gemini returned an empty response (no parts).");
    }

    const firstPart = content.parts[0];

    let generatedImageBuffer: Buffer;
    let generatedMimeType = "image/png"; // Default

    if (firstPart.inlineData && firstPart.inlineData.data) {
      generatedImageBuffer = Buffer.from(firstPart.inlineData.data, "base64");
      generatedMimeType = firstPart.inlineData.mimeType || "image/png";
    } else {
      console.log(
        "Gemini response did not contain inlineData. Response parts:",
        JSON.stringify(candidates[0].content.parts),
      );
      throw new Error(
        "Model returned text instead of image. Prompt might be blocked or model failed.",
      );
    }

    // 5. Upload to R2
    const fileName = `draping/${sessionId}/${type}_${uuidv4()}.png`;

    console.time(`R2-Upload-${type}`);
    try {
      await R2.putObject({
        Bucket: r2Bucket,
        Key: fileName,
        Body: generatedImageBuffer,
        ContentType: generatedMimeType,
        ACL: "public-read", // or rely on bucket policy
      }).promise();
    } catch (r2Error: any) {
      console.error("R2 Upload Error:", r2Error);
      throw new Error(`R2 Upload Failed: ${r2Error.message}`);
    }
    console.timeEnd(`R2-Upload-${type}`);

    const publicUrl = `https://${storageDomain}/${fileName}`;

    console.log(`Generated image uploaded to: ${publicUrl}`);

    // Save to DB for persistence
    await db.query(
      "insert into color_lab_images(session_id, url, image_type) values($1, $2, $3) on conflict do nothing",
      [sessionId, publicUrl, imageType],
    );

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("Draping Error:", error);
    // Return a friendly error or a placeholder if really needed, but for now let's be honest.
    return NextResponse.json(
      { error: error.message || "Failed to generate draping" },
      { status: 500 },
    );
  }
}
