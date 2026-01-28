import {NextRequest} from "next/server";
import {buildMockReport} from "../mockReport";
import {getColorLabReport, saveColorLabReport} from "~/servers/colorLab";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest
) {
  const sessionId = req.nextUrl?.searchParams?.get("sessionId");
  if (!sessionId) {
    return Response.json(
      {message: "sessionId is required"},
      {status: 400},
    );
  }

  const existing = await getColorLabReport(sessionId);
  if (existing) {
    return Response.json(existing);
  }

  return Response.json(
    {message: "report not found for this session"},
    {status: 404},
  );
}
