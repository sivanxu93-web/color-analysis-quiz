import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { saveColorLabReport } from "~/servers/colorLab";
import { deductCreditsForAnalysis } from "~/servers/colorLabCredits";
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
      "colors": [{"hex": "#...", "name": "string (Provide 8-10 essential neutral shades)"}],
      "usage_advice": "string (How to use these as the foundation of a wardrobe.)"
    },
    "power": {
      "colors": [{"hex": "#...", "name": "string (Provide 12-15 most impactful, soul-matching shades. This is the core value of the report.)"}],
      "usage_advice": "string (How to wear these for maximum impact, e.g., 'Best for dresses or near-face accessories'.)"
    },
    "pastels": {
      "colors": [{"hex": "#...", "name": "string (Provide 8-10 approachable pastel shades)"}],
      "usage_advice": "string (How to use these for a softer, more approachable look.)"
    }
  },
  "makeup": {
    "lips": [
      {"hex": "#...", "name": "string (Provide 5 distinct lipstick shades)", "brand_hint": "string"}
    ],
    "blush": [{"hex": "#...", "name": "string (Provide 3 distinct blush shades)", "brand_hint": "string"}],
    "eyes": [{"hex": "#...", "name": "string (Provide 4 distinct eyeshadow shades)", "brand_hint": "string"}]
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
    {"hex": "#...", "name": "string (Provide 6 colors to avoid)", "reason": "string"}
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
  let sessionId: string | undefined;
  try {
    const body = await req.json();
    sessionId = body.sessionId;
    const { email } = body;
    let { imageUrl } = body;

    if (!sessionId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();

    // 1. Get User ID
    const userRes = await db.query("select user_id from user_info where email = $1", [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    const userId = userRes.rows[0].user_id;

    // 2. ATOMIC DEDUCTION & RECOVERY (Idempotent)
    const deduction = await deductCreditsForAnalysis(userId, sessionId);
    if (!deduction.success) {
        if (deduction.message === "Insufficient credits") {
            return NextResponse.json({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
        }
        return NextResponse.json({ error: deduction.message }, { status: 400 });
    }

    // 3. Resolve Image URL
    if (!imageUrl) {
        const imgRes = await db.query(
            "SELECT url FROM color_lab_images WHERE session_id = $1 AND image_type = 'user_upload' ORDER BY created_at DESC LIMIT 1",
            [sessionId]
        );
        imageUrl = imgRes.rows[0]?.url;
        if (!imageUrl) return NextResponse.json({ error: "No image found for this session." }, { status: 400 });
    }

    // 4. CHECK IF ALREADY COMPLETED (Avoid re-running if already done)
    const checkRes = await db.query("SELECT status FROM color_lab_reports WHERE session_id = $1", [sessionId]);
    if (checkRes.rows[0]?.status === 'completed') {
        return NextResponse.json({ success: true, message: "Analysis already completed." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    // Fetch image data
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error("Failed to fetch image from URL");
    const imageBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    // Fetch quiz data if any
    const sessionInfoRes = await db.query("select quiz_data from color_lab_sessions where id = $1", [sessionId]);
    const quizData = sessionInfoRes.rows[0]?.quiz_data;

    let finalPrompt = SYSTEM_PROMPT;
    if (quizData) {
        finalPrompt += `\n\n**USER SELF-REPORTED DATA (from Quiz):**\nThe user provided this self-assessment. Use it to heavily inform your analysis, especially their goals and known traits:\n${JSON.stringify(quizData, null, 2)}\n`;
    }

    // Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.0 
      },
    });

    const result = await model.generateContent([
      finalPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    const analysisResult = JSON.parse(responseText);

    // 6. SAVE & UPDATE STATUS
    await saveColorLabReport(sessionId, analysisResult.season, analysisResult, 'completed', imageUrl);
    await db.query("update color_lab_sessions set status = 'analyzed', updated_at = now() where id = $1", [sessionId]);

    return NextResponse.json({ success: true, reportId: sessionId });

  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: error.message || "AI Analysis failed" }, { status: 500 });
  }
}
