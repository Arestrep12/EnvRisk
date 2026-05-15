"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { stockReply } from "@/lib/chat";
import type { ChatMessage } from "@/lib/chat";

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

function PanelToggleIcon({ side, collapsed }: { side: "left" | "right"; collapsed: boolean }) {
  const points =
    side === "left"
      ? collapsed
        ? "9 6 15 12 9 18"
        : "15 6 9 12 15 18"
      : collapsed
        ? "15 6 9 12 15 18"
        : "9 6 15 12 9 18";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M9 5v14" />
      <polyline points={points} />
    </svg>
  );
}

const chatHistory = [
  "Lluvias intensas en el Suroeste",
  "Riesgo de humo en el Valle de Aburrá",
  "Consulta rápida sobre sismos",
  "Revisión de boletín comunitario",
];

const chatRequestTimeoutMs = 32000;

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: stockReply,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isLoading) {
      return;
    }

    setPrompt("");
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmedPrompt },
    ];

    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => {
        controller.abort();
      }, chatRequestTimeoutMs);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });
      window.clearTimeout(timeout);

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };
      const assistantMessage = data.message;

      if (!response.ok || typeof assistantMessage !== "string" || !assistantMessage) {
        throw new Error(data.error ?? "No se pudo generar una respuesta.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      const fallbackMessage =
        error instanceof DOMException && error.name === "AbortError"
          ? "La consulta tardo mas de lo esperado. Intenta pedir un municipio y una fecha concreta."
          : error instanceof Error
          ? error.message
          : "Ocurrio un error inesperado al consultar la IA.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `No pude responder en este momento. ${fallbackMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--canvas)] text-[var(--ink)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,78,58,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(196,212,201,0.62),_transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(29,78,58,0.35),transparent)]" />

      <section className="relative flex h-screen w-full flex-col overflow-hidden px-6 pb-4 pt-4 sm:px-8 lg:px-10">
        <header className="fade-up flex items-start justify-between gap-4 border-b border-[var(--line)] pb-3">
          <Link href="/" className="transition-opacity duration-300 hover:opacity-80">
            <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]">
              Antioquia
            </p>
            <p className="mt-1 font-serif text-2xl text-[var(--brand)]">
              EnvRisk
            </p>
          </Link>
        </header>

        <div className="relative flex min-h-0 flex-1 gap-6 py-6">
          <aside
            aria-hidden={!showHistoryPanel}
            className={`fade-up hidden shrink-0 overflow-hidden transition-[width,opacity,transform,margin] duration-300 ease-out lg:flex [animation-delay:120ms] ${
              showHistoryPanel
                ? "mr-0 w-[280px] translate-x-0 opacity-100"
                : "pointer-events-none -ml-2 mr-[-0.5rem] w-0 -translate-x-5 opacity-0"
            }`}
          >
            <div className="flex h-full w-[280px] flex-col rounded-[2rem] border border-[var(--line)] bg-white/80 p-5 shadow-[0_24px_60px_rgba(26,54,43,0.06)] backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                      Historial
                    </p>
                    <p className="mt-2 font-serif text-3xl text-[var(--brand)]">
                      Chats
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 rounded-[1.2rem] bg-[var(--brand)] px-4 py-3 text-left text-sm font-medium text-white transition-colors duration-300 hover:bg-[var(--brand-strong)]"
                >
                  Nuevo chat
                </button>

                <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
                  {chatHistory.map((item) => (
                    <button
                      key={item}
                      title={item}
                      type="button"
                      className="block w-full overflow-hidden rounded-[1.3rem] border border-[var(--line)] bg-[var(--panel)] px-4 py-4 text-left text-sm leading-6 text-[var(--muted)] transition-colors duration-300 hover:border-[var(--brand)]"
                    >
                      <span className="block truncate">
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
          </aside>

          <section
            className="fade-up relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/82 p-4 shadow-[0_28px_80px_rgba(26,54,43,0.08)] backdrop-blur-sm [animation-delay:220ms] sm:p-5"
          >
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(29,78,58,0.25),transparent)]" />

            <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
              <button
                type="button"
                onClick={() => setShowHistoryPanel((current) => !current)}
                aria-label={showHistoryPanel ? "Ocultar historial" : "Mostrar historial"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--brand)] transition-colors duration-300 hover:bg-[var(--panel)]"
              >
                <PanelToggleIcon side="left" collapsed={!showHistoryPanel} />
              </button>
              <p className="text-center text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Chat ambiental activo
              </p>
              <div className="h-11 w-11 shrink-0" />
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4">
              <div className="flex min-h-full w-full flex-col justify-end gap-4">
                {messages.map((message, index) => (
                  <article
                    key={`${message.role}-${index}`}
                    className={`max-w-[85%] rounded-[1.7rem] px-5 py-4 shadow-[0_18px_40px_rgba(26,54,43,0.06)] ${
                      message.role === "user"
                        ? "ml-auto bg-[var(--brand)] text-white"
                        : "border border-[var(--line)] bg-white text-[var(--brand)]"
                    }`}
                  >
                    <p className="text-sm leading-7 sm:text-base">
                      {message.content}
                    </p>
                  </article>
                ))}
                {isLoading ? (
                  <article className="max-w-[85%] rounded-[1.7rem] border border-[var(--line)] bg-white px-5 py-4 text-[var(--brand)] shadow-[0_18px_40px_rgba(26,54,43,0.06)]">
                    <p className="text-sm leading-7 sm:text-base">
                      Pensando...
                    </p>
                  </article>
                ) : null}
              </div>
            </div>

            <div className="mt-auto pt-3">
              <div className="rounded-[1.8rem] border border-[var(--line)] bg-[rgba(248,244,236,0.95)] p-3 shadow-[0_18px_40px_rgba(26,54,43,0.08)] backdrop-blur-sm">
                <form className="flex items-end gap-3" onSubmit={handleSubmit}>
                  <label className="sr-only" htmlFor="chat-prompt">
                    Escribe tu consulta
                  </label>
                  <textarea
                    id="chat-prompt"
                    rows={1}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    disabled={isLoading}
                    placeholder="Escribe una consulta sobre riesgos ambientales o adjunta un archivo para analizar..."
                    className="min-h-12 flex-1 resize-none rounded-[1.3rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition-colors duration-300 placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
                  />

                  <button
                    type="submit"
                    aria-label={isLoading ? "Consultando" : "Enviar mensaje"}
                    disabled={isLoading}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white transition-all duration-300 hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <SendIcon />
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
