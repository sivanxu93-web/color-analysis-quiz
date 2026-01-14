import {NextRequest} from "next/server";
import {buildMockReport} from "../mockReport";
import {saveColorLabReport} from "~/servers/colorLab";

export async function POST(
  req: NextRequest,
  {params}: { params: { locale: string } },
) {
  const {locale} = params;
  const body = await req.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (!sessionId) {
    return Response.json(
      {message: "sessionId is required"},
      {
        status: 400,
      },
    );
  }

  // TODO: later use body.answers to build real AI prompt.
  const report = buildMockReport(locale);
  await saveColorLabReport(sessionId, report.classification.season, report);

  return Response.json({status: "ok"});
}

