import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { saveColorLabReport, checkIpLimit } from "~/servers/colorLab";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Allow longer timeout for AI analysis

const SYSTEM_PROMPT = `
YouYou are a world-renowned Celebrity Fashion Stylist and Color Scientist (think Vogue Editor-in-Chief meets Color Theory Professor). 
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
    "neutrals": [
      {"hex": "#...", "name": "string (Evocative name, e.g., 'French Navy', 'Oatmeal')"},
      {"hex": "#...", "name": "..."}
    ],
    "power": [
      {"hex": "#...", "name": "string (e.g., 'Royal Purple', 'Emerald')"},
      {"hex": "#...", "name": "..."}
    ],
    "pastels": [
      {"hex": "#...", "name": "string (e.g., 'Icy Lavender', 'Pale Lemon')"},
      {"hex": "#...", "name": "..."}
    ]
  },
  "makeup": {
    "lips": [
      {"hex": "#...", "name": "string", "brand_hint": "string (e.g. 'Like Mac Ruby Woo')"}, 
      {"hex": "#...", "name": "string"} 
    ],
    "blush": [{"hex": "#...", "name": "string", "brand_hint": "string"}],
    "eyes": [{"hex": "#...", "name": "string", "brand_hint": "string"}]
  },
  "makeup_recommendations": {
    "summary": "string (A paragraph guiding their overall makeup strategy)",
    "lipstick_guide": ["string (Detailed advice on finish and shade families)", "string"],
    "specific_products": [
       {"category": "Lipstick", "shade": "string", "recommendation": "string (e.g., 'Try Charlotte Tilbury Pillow Talk for a nude look')"},
       {"category": "Blush", "shade": "string", "recommendation": "string"}
    ]
  },
  "hair_color_recommendations": [
    {"color": "string (e.g. 'Dark Ash Brown')", "desc": "string (Why it works)"},
    {"color": "string", "desc": "string"}
  ],
  "fashion_guide": {
    "work": "string (Professional color combinations and fabric choices)",
    "casual": "string (Relaxed weekend looks)",
    "special_event": "string (Evening wear advice)"
  },
  "styling": {
    "metals": ["string (e.g., 'Platinum', 'Rose Gold')"],
    "fabrics": ["string (e.g., 'Crisp Cotton', 'Heavy Velvet', 'Silk Satin')"],
    "keywords": ["string (e.g., 'Dramatic', 'Ethereal', 'Polished')"],
    "accessories": "string (Specific advice, e.g., 'Opt for geometric silver earrings over dainty gold chains.')"
  },
  "worst_colors": [
    {"hex": "#...", "name": "string", "reason": "string (e.g., 'Makes skin look sallow', 'Overpowers delicate features')"}
  ],
  "virtual_draping_prompts": {
    "best_color_prompt": "string (A detailed prompt for the user wearing their #1 Best Power Color identified in this report. DO NOT invent a new color. Use the specific color name found in your 'palette.power' section. e.g., 'wearing a [Color Name] top'.)",
    "worst_color_prompt": "string (A detailed prompt for the user wearing their #1 Absolute Worst Color identified in this report. Use the specific color name found in your 'worst_colors' section. e.g., 'wearing a [Color Name] top'.)",
    "best_makeup_prompt": "string (A specific instruction for makeup that enhances this user's features based on their season. e.g., 'Apply a [Specific Lipstick Color] and a soft [Specific Blush Color] blush. Skin should look luminous.')",
    "worst_makeup_prompt": "string (A technical instruction for makeup/skin effects that optically clash with the user. Use physical terms like 'emphasize yellow undertones', 'increase contrast of under-eye shadows', 'apply disharmonious cool-toned lipstick'. DO NOT use emotional words like 'tired', 'sad', or 'ugly'.)"
  }
}

**CRITICAL RULES:**
1. Be specific. Don't just say "Red", say "Blue-based Cherry Red".
2. **CONSISTENCY CHECK:** The color mentioned in 'virtual_draping_prompts.best_color_prompt' MUST exist in the 'palette.power' list. The color in 'worst_color_prompt' MUST exist in 'worst_colors'.
3. Analyze the provided image deeply. If they have high contrast, mention it.
`;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

    // REMOVED: IP Limit Check
    // const allowed = await checkIpLimit(ip, 5, 24);

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

    // 2. Check Credits
    const creditRes = await db.query("select available_times from user_available where user_id = $1", [userId]);
    if (creditRes.rows.length === 0) {
        // Auto-create credit record if missing (safety net)
        const freeTimes = Number(process.env.FREE_TIMES || 0);
        await db.query("insert into user_available(user_id, available_times) values($1, $2)", [userId, freeTimes]);
        
        // Log the bonus
        if (freeTimes > 0) {
            await db.query("insert into credit_logs(user_id, amount, type, description) values($1, $2, 'bonus', 'Beta test free credits')", [userId, freeTimes]);
        }

        if (freeTimes <= 0) {
             return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
        }
    } else {
        const credits = creditRes.rows[0].available_times;
        if (credits <= 0) {
             return NextResponse.json({ error: "Insufficient credits. Please upgrade." }, { status: 402 });
        }
    }

    // 3. Note: Deduct Credit will happen AFTER successful analysis to prevent charging for failures.


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
    console.log("apiKey", apiKey);
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
      model: "gemini-2.5-pro",
      generationConfig: { responseMimeType: "application/json" },
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

    // Save report to DB
    await saveColorLabReport(sessionId, analysisResult.season, analysisResult);

    // Update session status
    await db.query("update color_lab_sessions set status = $1 where id = $2", [
      "analyzed",
      sessionId,
    ]);

    // *** DEDUCT CREDIT HERE (Success Only) ***
    await db.query("update user_available set available_times = available_times - 1 where user_id = $1", [userId]);
    await db.query("insert into credit_logs(user_id, amount, type, description) values($1, -1, 'usage', $2)", [userId, `AI Analysis: ${sessionId}`]);

    return NextResponse.json({ success: true, reportId: sessionId });
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
