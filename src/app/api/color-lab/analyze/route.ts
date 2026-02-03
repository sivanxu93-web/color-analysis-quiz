import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { saveColorLabReport, checkIpLimit } from "~/servers/colorLab";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Allow longer timeout for AI analysis

const SYSTEM_PROMPT = `
You are a world-renowned Celebrity Fashion Stylist and Color Scientist (representing 'Color Analysis Quiz'). 
Your task is to provide a life-changing, hyper-personalized Seasonal Color Analysis for the user.

**YOUR GOAL:**
Not just to label them, but to provide an actionable "Beauty & Style Manifesto" that transforms how they shop and dress.

**STRICT OUTPUT FORMAT:**
Return ONLY valid JSON. No markdown formatting. No code blocks.

**JSON STRUCTURE:**
{
  "season": "string (e.g., 'Deep Winter', 'Soft Summer')",
  "headline": "string (A captivating, magazine-cover style headline summing up their vibe. e.g., 'The Dark Romantic', 'Golden Hour Glow')",
  "description": "string (A warm, empowering, and highly specific paragraph describing WHY this is their season. Focus on the harmony between their skin's undertone and the recommended colors.)",
  "characteristics": {
    "skin": "string (Micro-observation: e.g., 'Porcelain with cool blue undertones', 'Warm olive with golden surface tones')",
    "eyes": "string (Micro-observation: e.g., 'Deep espresso with a charcoal rim', 'Sparkling amber with sunburst patterns')",
    "hair": "string (Micro-observation: e.g., 'Ash brown with cool glints', 'Rich chestnut absorbing light')"
  },
  "celebrities": ["string (Name of a famous celebrity sharing this season)", "string", "string"],
  "palette": {
    "neutrals": {
      "colors": [{"hex": "#...", "name": "string"}],
      "usage_advice": "string (How to use these as the foundation of a wardrobe.)"
    },
    "power": {
      "colors": [{"hex": "#...", "name": "string (The most impactful, soul-matching shades of the season. Can be deep, rich, or vibrant depending on the season.)"}],
      "usage_advice": "string (How to wear these for maximum impact, e.g., 'Best for dresses or near-face accessories'.)"
    },
    "pastels": {
      "colors": [{"hex": "#...", "name": "string"}],
      "usage_advice": "string (How to use these for a softer, more approachable look.)"
    }
  },
  "makeup": {
    "lips": [
      {"hex": "#...", "name": "string", "brand_hint": "string"}
    ],
    "blush": [{"hex": "#...", "name": "string", "brand_hint": "string"}],
    "eyes": [{"hex": "#...", "name": "string", "brand_hint": "string"}]
  },
  "makeup_recommendations": {
    "summary": "string (A paragraph guiding their overall makeup strategy focusing on natural enhancement.)",
    "lipstick_guide": ["string", "string"],
    "specific_products": [
       {"category": "Lipstick", "shade": "string", "recommendation": "string"},
       {"category": "Blush", "shade": "string", "recommendation": "string"}
    ]
  },
  "hair_color_recommendations": [
    {"color": "string", "desc": "string"}
  ],
  "fashion_guide": {
    "work": "string",
    "casual": "string",
    "special_event": "string"
  },
  "styling": {
    "metals": ["string"],
    "fabrics": ["string"],
    "keywords": ["string"],
    "accessories": "string"
  },
  "worst_colors": [
    {"hex": "#...", "name": "string", "reason": "string"}
  ],
  "virtual_draping_prompts": {
    "best_color_prompt": "string (Focus ONLY on the garment. Instruction: Replace the existing top with a high-quality [Color Name] [Fabric, e.g., silk/cotton] top. Keep the person's face, expression, and pose EXACTLY as in the original photo.)",
    "worst_color_prompt": "string (Focus ONLY on the garment. Instruction: Replace the existing top with a [Color Name] top in a flat, plain fabric. Keep the person's face, expression, and pose EXACTLY as in the original photo. No backgrounds, no changes to the face.)",
    "best_makeup_prompt": "string (Instructions for a 'Skin-First' look. Use words like 'sheer', 'translucent', 'minimalist'. Enhance only.)",
    "worst_makeup_prompt": "string (CRITICAL: KEEP ORIGINAL MAKEUP. NO CHANGES.)"
  }
}

**CRITICAL RULES:**
1. **DEDUCTIVE DRAPING:** The prompts must be INSTRUCTIONS for an image-to-image model. DO NOT use descriptive "beauty shot" or "photography" language. Use: "Change clothing to [Hex] [Color Name] with [Fabric] texture".
2. **ZERO ALTERATION:** Explicitly forbid changing the user's hair, eyes, facial structure, or expression.
3. **FABRIC REALISM:** Focus on "Textile Texture" (e.g., 'soft matte cotton', 'smooth silk') to ensure a high-end feel without changing the composition.
4. **NO PROPS:** Forbid adding props (like the grey cloth you mentioned). The person should just be wearing a standard top.
`;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { sessionId, imageUrl, email } = body;

    if (!sessionId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getDb();

    // CREDIT CHECK SYSTEM
    if (!email) {
      return NextResponse.json(
        { error: "Please login to continue." },
        { status: 401 }
      );
    }

    // 1. Get User ID
    const userRes = await db.query(
      "select user_id from user_info where email = $1",
      [email]
    );
    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found. Please login again." },
        { status: 401 }
      );
    }
    const userId = userRes.rows[0].user_id;

    // 2. CHECK FOR EXISTING PENDING REPORTS (Anti-Abuse & Conversion Logic)
    // User can only have ONE pending (protected/analyzing) report at a time.
    const pendingRes = await db.query(
        `SELECT id FROM color_lab_sessions 
         WHERE email = $1 
         AND (status = 'protected' OR status = 'analyzing')
         LIMIT 1`,
        [email]
    );

    if (pendingRes.rows.length > 0) {
        return NextResponse.json(
            { 
                error: "You already have a pending report.", 
                code: "PENDING_REPORT_EXISTS",
                sessionId: pendingRes.rows[0].id 
            },
            { status: 409 }
        );
    }

    // 3. Check Credits - REMOVED for Teaser Model
    // We allow analysis even with 0 credits. Credits are required to UNLOCK.
    /*
    const creditRes = await db.query("select available_times from user_available where user_id = $1", [userId]);
    // ... logic removed ...
    */

    // If email is provided (from the lead magnet modal), save it!
    if (email) {
      await db.query("update color_lab_sessions set email = $1 where id = $2", [
        email,
        sessionId,
      ]);
      // Also add to waitlist for marketing
      await db.query(
        "insert into color_lab_waitlist(email, locale, interest) values($1, $2, $3) ON CONFLICT (email) DO NOTHING",
        [email, "en", "color-lab-report"]
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Update session status
    await db.query("update color_lab_sessions set status = $1 where id = $2", [
      "analyzing",
      sessionId,
    ]);

    // Fetch image data
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error("Failed to fetch image from URL");
    const imageBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    // Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.0 // Reduce randomness
      },
    });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON Parse Error:", responseText);
      throw new Error("Invalid JSON response from AI");
    }

    // Save report to DB with 'protected' status (Teaser Mode)
    await saveColorLabReport(
        sessionId, 
        analysisResult.season, 
        analysisResult, 
        'protected', 
        imageUrl
    );

    // Update session status to 'protected' explicitly
    await db.query("update color_lab_sessions set status = $1 where id = $2", [
      "protected",
      sessionId,
    ]);

    // *** NO DEDUCTION HERE ***
    // Deduction happens in /api/color-lab/unlock

    return NextResponse.json({ success: true, reportId: sessionId });
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}