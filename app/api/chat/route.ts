import { NextResponse } from "next/server";
import type { ChatMessage } from "@/lib/chat";
import type { ClimateToolInput } from "@/lib/envrisk-tools/weather";
import { runClimateTool } from "@/lib/envrisk-tools/weather";

const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqFetchTimeoutMs = 25000;

export const maxDuration = 30;

type GroqMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: GroqMessage;
  }>;
};

const systemPrompt = `
Eres el asistente de EnvRisk.
Tu alcance territorial principal es el departamento de Antioquia en Colombia.
Responde siempre en espanol claro y directo.
Tienes una herramienta llamada get_climate_context para consultar datos climaticos de Open-Meteo, NASA POWER e IDEAM/datos.gov.co.
Para cualquier pregunta sobre clima, lluvia, precipitacion, temperatura, pronostico, historico meteorologico, estaciones o fuentes climaticas, debes llamar primero a get_climate_context.
Formato de uso de get_climate_context: llama la herramienta con JSON estructurado.
Incluye variable, location, date y timeframe cuando existan. Usa date en formato YYYY-MM-DD.
El campo location debe ser la ubicacion resuelta, agregando Antioquia, Colombia cuando el usuario no especifique pais/departamento.
El campo message es opcional y sirve para conservar la solicitud completa en lenguaje natural.
Ejemplo: si el usuario pregunto por precipitacion en Jardin el 13 de mayo de 2026 y luego confirma "si, el municipio", llama get_climate_context con {"variable":"precipitation","location":"Jardin, Antioquia, Colombia","date":"2026-05-13","timeframe":"historical","scope":"municipio","message":"Precipitacion en el municipio de Jardin, Antioquia, Colombia el 13 de mayo de 2026"}.
Interpreta solicitudes escritas en lenguaje natural, aunque tengan orden, preposiciones o puntuacion imperfecta.
Cuando el usuario mencione municipios, corregimientos o ciudades sin pais/departamento, asume que se refiere a Antioquia, Colombia.
Si el usuario confirma una ubicacion despues de que preguntaste algo, usa el historial de la conversacion para llamar la herramienta con la solicitud completa.
Si el usuario dice "si", "correcto", "el municipio", "casco urbano", "cabecera municipal" o "centro", interpreta esa respuesta como aclaracion de la ubicacion previa.
Si la herramienta devuelve una directAnswer, responde exactamente con esa directAnswer.
Si la herramienta devuelve contexto con datos climaticos, usa esos datos y cita las fuentes disponibles de forma breve.
No digas que no tienes acceso a datos climaticos si la herramienta devolvio datos.
No recomiendes consultar manualmente Open-Meteo, NASA POWER o datos.gov.co si ya recibiste contexto de la herramienta.
Si solo una fuente trae el dato exacto, dilo explicitamente y presenta la respuesta como estimacion o dato de esa fuente, no como verdad institucional confirmada.
Si el usuario pregunta por alertas activas o emergencias en curso, aclara que los datos climaticos no son alertas oficiales y recomienda verificar IDEAM, DAGRAN o autoridades locales segun la zona.
Ayuda con orientacion general, explicaciones, prevencion y siguientes pasos prudentes.
`.trim();

const tools = [
  {
    type: "function",
    function: {
      name: "get_climate_context",
      description:
        "Consulta datos climaticos para Antioquia usando Open-Meteo, NASA POWER e IDEAM/datos.gov.co. Usala para clima, lluvia, precipitacion, temperatura, pronostico, historico meteorologico, estaciones o aclaraciones de ubicacion relacionadas con una consulta climatica previa.",
      parameters: {
        type: "object",
        properties: {
          variable: {
            type: "string",
            enum: [
              "precipitation",
              "temperature",
              "weather",
              "wind",
              "humidity",
              "stations",
              "alerts",
            ],
            description:
              "Variable climatica principal solicitada por el usuario.",
          },
          location: {
            type: "string",
            description:
              "Municipio, corregimiento, vereda, ciudad o coordenadas. Si no se especifica pais/departamento, resuelve como Antioquia, Colombia.",
          },
          date: {
            type: "string",
            description:
              "Fecha exacta solicitada en formato YYYY-MM-DD. Omite este campo si no hay fecha exacta.",
          },
          timeframe: {
            type: "string",
            enum: ["current", "daily", "historical", "forecast"],
            description:
              "Horizonte temporal de la consulta climatica.",
          },
          scope: {
            type: "string",
            description:
              "Alcance espacial aclarado por el usuario, por ejemplo municipio, casco urbano, centro, vereda o coordenadas.",
          },
          message: {
            type: "string",
            description:
              "Solicitud climatica completa en lenguaje natural. Incluye contexto del historial si el ultimo mensaje solo confirma o aclara la ubicacion.",
          },
        },
        required: ["variable", "location"],
        additionalProperties: false,
      },
    },
  },
] as const;

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

function parseToolArguments(argumentsText: string): ClimateToolInput | null {
  try {
    const parsed = JSON.parse(argumentsText) as Record<string, unknown>;

    if (
      typeof parsed.variable === "string" &&
      typeof parsed.location === "string" &&
      parsed.location.trim()
    ) {
      return {
        variable: parsed.variable as ClimateToolInput["variable"],
        location: parsed.location,
        date: typeof parsed.date === "string" ? parsed.date : undefined,
        timeframe:
          typeof parsed.timeframe === "string"
            ? (parsed.timeframe as ClimateToolInput["timeframe"])
            : undefined,
        scope: typeof parsed.scope === "string" ? parsed.scope : undefined,
        message: typeof parsed.message === "string" ? parsed.message : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

async function callGroq({
  groqApiKey,
  groqModel,
  messages,
  includeTools,
}: {
  groqApiKey: string;
  groqModel: string;
  messages: GroqMessage[];
  includeTools: boolean;
}) {
  const response = await fetch(groqApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(groqFetchTimeoutMs),
    body: JSON.stringify({
      model: groqModel,
      max_tokens: 900,
      temperature: 0.1,
      messages,
      ...(includeTools
        ? {
            tools,
            tool_choice: "auto",
          }
        : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText);
  }

  return (await response.json()) as GroqChatResponse;
}

export async function POST(request: Request) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL;

  if (!groqApiKey) {
    return NextResponse.json(
      {
        error: "Falta configurar GROQ_API_KEY en el entorno del servidor.",
      },
      { status: 500 },
    );
  }

  if (!groqModel) {
    return NextResponse.json(
      {
        error: "Falta configurar GROQ_MODEL en el entorno del servidor.",
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

  const groqMessages: GroqMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...messages,
  ];

  try {
    const firstGroqResponse = await callGroq({
      groqApiKey,
      groqModel,
      messages: groqMessages,
      includeTools: true,
    });
    const assistantMessage = firstGroqResponse.choices?.[0]?.message;
    const toolCalls = assistantMessage?.tool_calls ?? [];

    if (assistantMessage?.content && toolCalls.length === 0) {
      return NextResponse.json({ message: assistantMessage.content.trim() });
    }

    if (toolCalls.length === 0) {
      return NextResponse.json(
        { error: "Groq no devolvio contenido ni llamadas a herramientas." },
        { status: 502 },
      );
    }

    const toolMessages = await Promise.all(
      toolCalls.map(async (toolCall) => {
        if (toolCall.function.name !== "get_climate_context") {
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: `Herramienta no soportada: ${toolCall.function.name}`,
            }),
          };
        }

        const toolInput = parseToolArguments(toolCall.function.arguments);

        if (!toolInput) {
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error:
                "La herramienta requiere argumentos estructurados: variable y location como texto.",
            }),
          };
        }

        const result = await runClimateTool(toolInput);

        return {
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        };
      }),
    );

    const directAnswer = toolMessages
      .map((message) => {
        try {
          return (JSON.parse(message.content ?? "{}") as { directAnswer?: unknown })
            .directAnswer;
        } catch {
          return null;
        }
      })
      .find((answer): answer is string => typeof answer === "string" && answer.length > 0);

    if (directAnswer) {
      return NextResponse.json({ message: directAnswer });
    }

    const finalGroqResponse = await callGroq({
      groqApiKey,
      groqModel,
      messages: [
        ...groqMessages,
        {
          role: "assistant",
          content: assistantMessage?.content ?? null,
          tool_calls: toolCalls,
        },
        ...toolMessages,
      ],
      includeTools: false,
    });
    const content = finalGroqResponse.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Groq no devolvio contenido para la respuesta." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: content });
  } catch (error) {
    const errorMessage =
      error instanceof DOMException && error.name === "TimeoutError"
        ? "La generacion tardo mas de lo permitido. Intenta una consulta mas especifica."
        : error instanceof Error
          ? `No fue posible completar la consulta con Groq. ${error.message}`
          : "No fue posible completar la consulta con Groq.";

    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }
}
