import { NextRequest, NextResponse } from "next/server";
import { createColorLabSession } from "~/servers/colorLab";

export async function POST(req: NextRequest) {
  try {
    let email = null;
    try {
      const body = await req.json();
      email = body.email;
    } catch (e) {
      // Ignore JSON parse error (empty body)
    }
    
    // Get IP
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

    const sessionId = await createColorLabSession(email || null, ip);
    
    return NextResponse.json({ sessionId });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
