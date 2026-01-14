import {NextRequest, NextResponse} from "next/server";
import {createColorLabSession} from "~/servers/colorLab";

export async function POST(
  req: NextRequest,
  {params}: { params: { locale: string } },
) {
  try {
    const _locale = params.locale;
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" && body.email.length > 3
        ? body.email
        : null;

    const sessionId = await createColorLabSession(email);

    return NextResponse.json({sessionId});
  } catch (error: any) {
    console.error("Session creation error (locale):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

