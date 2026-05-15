import { NextResponse } from "next/server";
import type { ClimateToolInput } from "@/lib/envrisk-tools/weather";
import { runClimateTool } from "@/lib/envrisk-tools/weather";

export const maxDuration = 30;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON valido." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "La solicitud debe incluir un objeto JSON." },
      { status: 400 },
    );
  }

  const candidate = body as {
    message?: unknown;
    variable?: unknown;
    location?: unknown;
    date?: unknown;
    timeframe?: unknown;
    scope?: unknown;
  };
  const legacyMessage = candidate.message;
  const structuredInput: ClimateToolInput = {
    variable:
      typeof candidate.variable === "string"
        ? (candidate.variable as ClimateToolInput["variable"])
        : undefined,
    location: typeof candidate.location === "string" ? candidate.location : undefined,
    date: typeof candidate.date === "string" ? candidate.date : undefined,
    timeframe:
      typeof candidate.timeframe === "string"
        ? (candidate.timeframe as ClimateToolInput["timeframe"])
        : undefined,
    scope: typeof candidate.scope === "string" ? candidate.scope : undefined,
    message: typeof legacyMessage === "string" ? legacyMessage : undefined,
  };
  const hasStructuredInput = Boolean(
    structuredInput.variable && structuredInput.location,
  );

  if (
    !hasStructuredInput &&
    (typeof legacyMessage !== "string" || legacyMessage.trim().length === 0)
  ) {
    return NextResponse.json(
      {
        error:
          "La solicitud debe incluir variable y location, o message como texto.",
      },
      { status: 400 },
    );
  }

  const result = await runClimateTool(
    hasStructuredInput ? structuredInput : String(legacyMessage),
  );

  if (!result) {
    return NextResponse.json({
      context: null,
      directAnswer: null,
    });
  }

  return NextResponse.json(result);
}
