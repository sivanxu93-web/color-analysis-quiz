import {NextRequest} from "next/server";
import {addToColorLabWaitlist} from "~/servers/colorLab";

export async function POST(
  req: NextRequest,
) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const interest =
    typeof body.interest === "string" ? body.interest.trim() : "";
  const price_range =
    typeof body.price_range === "string" ? body.price_range.trim() : "";

  if (!email || !email.includes("@")) {
    return Response.json(
      {message: "Valid email is required"},
      {status: 400},
    );
  }

  await addToColorLabWaitlist({
    email,
    locale: 'en', // Default to 'en' or extract from body if needed
    interest: interest || undefined,
    price_range: price_range || undefined,
  });

  return Response.json({ok: true});
}

