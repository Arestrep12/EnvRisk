"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/hero-terrain.svg",
    alt: "Ilustracion editorial del territorio de Antioquia con capas de relieve y monitoreo de riesgo.",
    title: "Deslizamientos",
    text: "Lectura visual del terreno, la lluvia y las zonas con mayor vulnerabilidad.",
  },
  {
    src: "/hero-fire-watch.svg",
    alt: "Ilustracion de alerta temprana ante incendios forestales.",
    title: "Incendios forestales",
    text: "Advertencias tempranas y contexto local para actuar con velocidad.",
  },
  {
    src: "/hero-seismic.svg",
    alt: "Ilustracion de monitoreo sismico y orientacion preventiva.",
    title: "Sismos",
    text: "Consulta inmediata para interpretar eventos y recibir orientacion preventiva.",
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4200);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-[var(--line)] bg-white/78 p-3 shadow-[0_30px_80px_rgba(26,54,43,0.08)] backdrop-blur-sm">
        <div className="relative h-[420px] sm:h-[500px] lg:h-[620px]">
          {slides.map((slide, index) => (
            <article
              key={slide.title}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                index === activeIndex
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-6 opacity-0"
              }`}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                width={1600}
                height={900}
                priority={index === 0}
                className="h-full w-full rounded-[1.7rem] object-contain bg-[#eef1e7] p-4 sm:p-5 lg:p-6"
              />
              <div className="absolute inset-x-6 bottom-6 rounded-[1.6rem] border border-white/60 bg-white/82 p-5 backdrop-blur-sm sm:inset-x-9 sm:bottom-9 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {`0${index + 1}`}
                </p>
                <h2 className="mt-3 font-serif text-3xl text-[var(--brand)] sm:text-4xl">
                  {slide.title}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {slide.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Ver slide ${index + 1}: ${slide.title}`}
            aria-pressed={index === activeIndex}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-12 bg-[var(--brand)]"
                : "w-2.5 bg-[var(--line-strong)] hover:bg-[var(--muted)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
