"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

function PaperclipIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.9-9.9a4 4 0 1 1 5.66 5.66l-10.6 10.6a2 2 0 0 1-2.83-2.83l9.2-9.19" />
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

const quickPrompts = [
  "¿Hay riesgo de deslizamiento hoy en el Oriente antioqueño?",
  "Resume las recomendaciones ante humo por incendios forestales.",
  "¿Qué significa una alerta sísmica preventiva y cómo actuar?",
];

const chatHistory = [
  "Lluvias intensas en el Suroeste",
  "Riesgo de humo en el Valle de Aburrá",
  "Consulta rápida sobre sismos",
  "Revisión de boletín comunitario",
];

const stockReply = "Bienvenido, ¿En qué te puedo ayudar?";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [showPromptsPanel, setShowPromptsPanel] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: stockReply,
    },
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmedPrompt },
      { role: "assistant", content: stockReply },
    ]);
    setPrompt("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--canvas)] text-[var(--ink)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,78,58,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(196,212,201,0.62),_transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(29,78,58,0.35),transparent)]" />

      <section className="relative flex h-screen w-full flex-col overflow-hidden px-6 pb-6 pt-6 sm:px-8 lg:px-10">
        <header className="fade-up flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]">
              Antioquia
            </p>
            <p className="mt-2 font-serif text-2xl text-[var(--brand)]">
              EnvRisk
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/76 px-4 py-2 text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
              Sesion activa
            </span>
            <Link
              href="/"
              className="rounded-full border border-[var(--brand)]/18 bg-white/80 px-4 py-2 text-sm font-medium text-[var(--brand)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Volver a la landing
            </Link>
          </div>
        </header>

        <div className="relative flex flex-1 overflow-hidden py-6">
          {showHistoryPanel ? (
            <aside className="fade-up absolute bottom-0 left-0 top-6 hidden w-[280px] flex-col lg:flex [animation-delay:120ms]">
              <div className="flex h-full flex-col rounded-[2rem] border border-[var(--line)] bg-white/80 p-5 shadow-[0_24px_60px_rgba(26,54,43,0.06)] backdrop-blur-sm">
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
                      type="button"
                      className="block w-full rounded-[1.3rem] border border-[var(--line)] bg-[var(--panel)] px-4 py-4 text-left text-sm leading-6 text-[var(--muted)] transition-colors duration-300 hover:border-[var(--brand)]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}

          <section
            className="fade-up relative mx-auto flex min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/82 p-4 shadow-[0_28px_80px_rgba(26,54,43,0.08)] backdrop-blur-sm [animation-delay:220ms] sm:p-5"
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
              <p className="hidden text-xs uppercase tracking-[0.3em] text-[var(--muted)] sm:block">
                Chat ambiental activo
              </p>
              <button
                type="button"
                onClick={() => setShowPromptsPanel((current) => !current)}
                aria-label={showPromptsPanel ? "Ocultar prompts" : "Mostrar prompts"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--brand)] transition-colors duration-300 hover:bg-[var(--panel)]"
              >
                <PanelToggleIcon side="right" collapsed={!showPromptsPanel} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4">
              <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-end gap-4">
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
              </div>
            </div>

            <div className="mt-auto pt-3">
              <div className="rounded-[1.8rem] border border-[var(--line)] bg-[rgba(248,244,236,0.95)] p-3 shadow-[0_18px_40px_rgba(26,54,43,0.08)] backdrop-blur-sm">
                <form className="flex items-end gap-3" onSubmit={handleSubmit}>
                  <button
                    type="button"
                    aria-label="Adjuntar archivo"
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--brand)] transition-colors duration-300 hover:bg-[var(--panel)]"
                  >
                    <PaperclipIcon />
                  </button>

                  <label className="sr-only" htmlFor="chat-prompt">
                    Escribe tu consulta
                  </label>
                  <textarea
                    id="chat-prompt"
                    rows={1}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Escribe una consulta sobre riesgos ambientales o adjunta un archivo para analizar..."
                    className="min-h-12 flex-1 resize-none rounded-[1.3rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition-colors duration-300 placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
                  />

                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--brand-strong)]"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          </section>

          {showPromptsPanel ? (
            <aside className="fade-up absolute bottom-0 right-0 top-6 hidden w-[280px] flex-col lg:flex [animation-delay:120ms]">
              <div className="flex h-full flex-col rounded-[2rem] border border-[var(--line)] bg-[var(--brand)] px-6 py-7 text-[var(--brand-contrast)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/65">
                      Prompts sugeridos
                    </p>
                    <p className="mt-2 font-serif text-3xl text-white">
                      Atajos
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setPrompt(prompt)}
                      className="block w-full rounded-[1.2rem] border border-white/14 bg-white/10 px-4 py-3 text-left text-sm leading-6 transition-colors duration-300 hover:bg-white/16"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  );
}
