import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/libs/authOptions";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { outfitId } = await req.json();

    if (!outfitId) {
      return NextResponse.json({ error: "Outfit ID is required" }, { status: 400 });
    }

    const db = getDb();

    // 1. Fetch Outfit and associated User Report
    const dataRes = await db.query(`
        SELECT 
            o.image_url as outfit_image,
            r.season,
            r.payload->>'characteristics' as characteristics,
            r.payload->'palette'->'power'->>'colors' as power_colors,
            r.payload->>'worst_colors' as worst_colors
        FROM color_lab_outfits o
        JOIN color_lab_reports r ON o.session_id = r.session_id
        WHERE o.id = $1 AND o.email = $2
    `, [outfitId, email]);

    if (dataRes.rowCount === 0) {
        return NextResponse.json({ error: "Outfit or Report not found" }, { status: 404 });
    }

    const data = dataRes.rows[0];

    // 2. Mark as processing
    await db.query("UPDATE color_lab_outfits SET status = 'processing' WHERE id = $1", [outfitId]);

    // 3. Prepare the Prompt for Gemini
    const systemPrompt = `You are an expert personal stylist and color analyst. 
    You are evaluating if a specific piece of clothing (provided in the image) is suitable for a client based on their 12-season color profile.
    
    CLIENT PROFILE:
    - Season: ${data.season}
    - Characteristics: ${data.characteristics}
    - Power Colors: ${data.power_colors}
    - Colors to Avoid: ${data.worst_colors}

    TASK:
    1. Analyze the main color and undertone of the clothing item in the image.
    2. Determine if it matches the client's season (Warm vs Cool, High vs Low Contrast, Muted vs Bright).
    3. Output your final verdict in JSON format.

    EXPECTED JSON SCHEMA:
    {
      "is_match": boolean, // true if it looks good, false if they should avoid it
      "score": number, // 1 to 5, where 5 is perfect match
      "clothing_color_description": string, // e.g., "Muted sage green with cool undertones"
      "verdict_title": string, // e.g., "Perfect Harmony!" or "Proceed with Caution"
      "reasoning": string, // Detailed explanation of why it works or clashes with their skin tone
      "styling_advice": string // If it's a match, how to style it. If it clashes, how to "rescue" it (e.g., "Wear it away from the face").
    }`;

    // 4. Fetch image and prepare for Gemini
    const imageResp = await fetch(data.outfit_image);
    if (!imageResp.ok) throw new Error("Failed to fetch outfit image from URL");
    const imageBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.2 // Slight creativity for styling advice, but keep it grounded
      },
    });

    // 5. Call Gemini Vision
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    let aiResult;
    try {
      aiResult = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON Parse Error:", responseText);
      throw new Error("Invalid JSON response from AI");
    }

    // 6. Save the result
    await db.query(
        "UPDATE color_lab_outfits SET status = 'completed', ai_result = $1 WHERE id = $2",
        [aiResult, outfitId]
    );

    return NextResponse.json({ success: true, result: aiResult });

  } catch (error: any) {
    console.error("Validator Analyze Error:", error);
    // Try to update status to failed if possible, but don't crash if it fails
    try {
        const { outfitId } = await req.json();
        if(outfitId) {
             await getDb().query("UPDATE color_lab_outfits SET status = 'failed' WHERE id = $1", [outfitId]);
        }
    } catch(e) {}

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
