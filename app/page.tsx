import Link from "next/link";
import { HeroCarousel } from "./components/hero-carousel";

export default function Home() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[var(--canvas)] text-[var(--ink)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,78,58,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(196,212,201,0.7),_transparent_28%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(29,78,58,0.35),transparent)]" />

            <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-10 lg:px-16">
                <header className="fade-up flex items-center justify-between border-b border-[var(--line)] pb-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.42em] text-[var(--muted)]">
                            Antioquia
                        </p>
                        <p className="mt-2 font-serif text-2xl text-[var(--brand)]">
                            EnvRisk
                        </p>
                    </div>
                    <Link
                        className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_18px_40px_rgba(29,78,58,0.18)]"
                        href="/chat"
                    >
                        Chat
                    </Link>
                </header>

                <div className="flex flex-1 flex-col justify-center py-10 lg:py-16">
                    <div className="space-y-8">
                        <div className="fade-up inline-flex w-fit items-center gap-3 rounded-full border border-[var(--line-strong)] bg-white/72 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--muted)] [animation-delay:120ms]">
                            <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                            IA generativa para consultas y alertas ambientales
                        </div>

                        <div className="space-y-6">
                            <h1 className="fade-up max-w-5xl font-serif text-6xl leading-none tracking-[-0.05em] text-[var(--brand)] [animation-delay:220ms] sm:text-7xl lg:text-[7.5rem]">
                                Entender el riesgo
                                <br />
                                antes de que
                                <br />
                                se convierta en crisis.
                            </h1>
                            <p className="fade-up max-w-3xl text-base leading-8 text-[var(--muted)] [animation-delay:320ms] sm:text-lg">
                                La app ayuda a consultar, interpretar y
                                anticipar riesgos medioambientales dentro de
                                Antioquia. Reune informacion relevante en
                                lenguaje claro para responder preguntas y emitir
                                advertencias oportunas sobre deslizamientos,
                                terremotos, incendios forestales y otras
                                amenazas del territorio.
                            </p>
                        </div>
                    </div>

                    <div className="fade-up mt-10 flex flex-col gap-4 sm:flex-row [animation-delay:420ms]">
                        <a
                            className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--brand-strong)] hover:shadow-[0_18px_40px_rgba(29,78,58,0.18)]"
                            href="#hero-gallery"
                        >
                            Ver el monitoreo visual
                        </a>
                        <a
                            className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-6 py-3 text-sm font-semibold text-[var(--brand)] transition-all duration-300 hover:border-[var(--brand)] hover:bg-white/70"
                            href="#principios"
                        >
                            Explorar riesgos
                        </a>
                    </div>
                </div>

                <section
                    id="hero-gallery"
                    className="fade-up border-t border-[var(--line)] py-8 [animation-delay:520ms]"
                >
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                                Monitoreo visual
                            </p>
                            <p className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-[var(--brand)]">
                                Un carrusel editorial para leer el territorio,
                                sus alertas y su contexto.
                            </p>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
                            La seccion funciona como una franja horizontal de
                            hero: piezas amplias, desplazamiento lateral y foco
                            visual en deslizamientos, incendios y sismos.
                        </p>
                    </div>

                    <HeroCarousel />
                </section>

                <section
                    id="estilo"
                    className="grid gap-6 border-t border-[var(--line)] pt-8 lg:grid-cols-[1.1fr_0.9fr]"
                >
                    <div className="fade-up rounded-[2rem] bg-[var(--brand)] px-8 py-10 text-[var(--brand-contrast)] [animation-delay:620ms]">
                        <p className="text-xs uppercase tracking-[0.34em] text-white/60">
                            Propuesta
                        </p>
                        <p className="mt-4 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
                            Una interfaz conversacional que traduce datos y
                            contexto local en orientacion preventiva y
                            advertencias utiles.
                        </p>
                    </div>

                    <div
                        id="principios"
                        className="fade-up grid gap-4 rounded-[2rem] border border-[var(--line)] bg-white/80 p-6 [animation-delay:720ms] sm:grid-cols-3 lg:grid-cols-1"
                    >
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                                Claridad
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                                Responde preguntas complejas en lenguaje simple
                                y accionable.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                                Orientacion
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                                Prioriza rutas de cuidado segun el tipo de
                                amenaza y el territorio.
                            </p>
                        </div>
                        <div id="contacto">
                            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                                Confianza
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                                Convierte datos tecnicos en advertencias
                                oportunas para actuar mejor.
                            </p>
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}
