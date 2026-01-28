import {NextRequest, NextResponse} from "next/server";
import {createColorLabSession} from "~/servers/colorLab";

export async function POST(
  req: NextRequest,
) {
  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" && body.email.length > 3
        ? body.email
        : null;
    
    // Get IP
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

    const sessionId = await createColorLabSession(email, ip);

    return NextResponse.json({sessionId});
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

