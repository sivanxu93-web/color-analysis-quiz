import { NextRequest, NextResponse } from "next/server";
import { getColorLabReportsByEmail } from "~/servers/colorLab";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const data = await getColorLabReportsByEmail(email);

    return NextResponse.json({ 
        success: true, 
        data: data 
    });

  } catch (error: any) {
    console.error("Fetch history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
