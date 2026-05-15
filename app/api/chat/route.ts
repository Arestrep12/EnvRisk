import { NextResponse } from "next/server";
import type { ChatMessage } from "@/lib/chat";
import { getClimateContextForMessage } from "@/lib/envrisk-tools/weather";

const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const systemPrompt = `
Eres el asistente de EnvRisk.
Tu alcance territorial principal es el departamento de Antioquia en Colombia.
Responde siempre en espanol claro y directo.
Puedes usar contexto consultado por herramientas server-side cuando este disponible.
No inventes datos en tiempo real, alertas activas, fuentes externas ni sucesos pasados que no esten en el contexto.
Cuando el usuario mencione municipios, corregimientos o ciudades sin pais/departamento, asume que se refiere a Antioquia, Colombia.
Si el lugar no parece pertenecer a Antioquia o hay ambiguedad razonable, pide aclaracion antes de entregar datos territoriales.
Si el usuario pregunta por clima y recibes contexto de herramientas, usalo y cita las fuentes disponibles de forma breve.
Si el usuario pregunta por alertas activas o emergencias en curso, aclara que los datos climaticos no son alertas oficiales y recomienda verificar IDEAM, DAGRAN o autoridades locales segun la zona.
Ayuda con orientacion general, explicaciones, prevencion y siguientes pasos prudentes.
`.trim();

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChatMessage>;

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return NextResponse.json(
      {
        error: "Falta configurar GROQ_API_KEY en el entorno del servidor.",
      },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON valido." },
      { status: 400 },
    );
  }

  const rawMessages =
    body && typeof body === "object" && "messages" in body
      ? (body as { messages?: unknown }).messages
      : undefined;

  if (!Array.isArray(rawMessages)) {
    return NextResponse.json(
      { error: "La solicitud debe incluir un arreglo messages." },
      { status: 400 },
    );
  }

  const messages = rawMessages.filter(isChatMessage).slice(-12);

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "No hay mensajes validos para procesar." },
      { status: 400 },
    );
  }

  try {
    const lastUserMessage = messages.findLast((message) => message.role === "user");
    const climateContext = lastUserMessage
      ? await getClimateContextForMessage(lastUserMessage.content)
      : null;

    const groqResponse = await fetch(groqApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...(climateContext
            ? [
                {
                  role: "system",
                  content: climateContext,
                },
              ]
            : []),
          ...messages,
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();

      return NextResponse.json(
        {
          error: "Groq devolvio un error al generar la respuesta.",
          detail: errorText,
        },
        { status: 502 },
      );
    }

    const data = (await groqResponse.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
        };
      }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Groq no devolvio contenido para la respuesta." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: content });
  } catch {
    return NextResponse.json(
      { error: "No fue posible conectar con Groq." },
      { status: 502 },
    );
  }
}
