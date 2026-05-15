# EnvRisk

EnvRisk es una aplicación construida con Next.js para consultas y advertencias sobre riesgos medioambientales en Antioquia. La interfaz actual incluye:

- Una landing page editorial en modo claro para presentar el producto.
- Una pantalla de chat para consultas sobre deslizamientos, sismos, incendios y otras amenazas del territorio.
- Un flujo de chat conectado a Groq con contexto climático server-side desde Open-Meteo, sin llaves adicionales.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- ESLint
- Bun como gestor recomendado

## Ejecutar el proyecto

Instala dependencias con el gestor que uses normalmente. En este repositorio se recomienda Bun.

```bash
bun install
```

Inicia el entorno de desarrollo:

```bash
bun dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Crea un archivo `.env.local` con al menos esta configuracion:

```bash
GROQ_API_KEY=tu_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

`GROQ_MODEL` es obligatorio y debe configurarse en el entorno; el modelo no tiene fallback hardcodeado en el código.

Las consultas climáticas usan Open-Meteo Forecast, Archive y Geocoding APIs, NASA POWER, y datasets de IDEAM en datos.gov.co sin API key. Estos datos no reemplazan alertas oficiales, reportes de daños ni registros institucionales de IDEAM, DAGRAN o autoridades locales.

## Scripts útiles

```bash
bun dev
bun run build
bun start
bun run lint
npx tsc --noEmit
```

## Estructura principal

- `app/page.tsx`: landing principal de EnvRisk.
- `app/chat/page.tsx`: interfaz del chatbot.
- `app/components/hero-carousel.tsx`: carrusel visual de la landing.
- `app/globals.css`: variables y estilos globales.
- `lib/envrisk-tools/weather.ts`: herramientas server-side sin API key para contexto climático con Open-Meteo, NASA POWER e IDEAM/datos.gov.co.
- `public/`: assets estáticos, incluyendo ilustraciones SVG.
- `GUIDE.md`: guía corta del proyecto y decisiones actuales de implementación.

## Calidad

Para cambios de código en este repositorio, la validación mínima esperada es:

```bash
bun run lint
npx tsc --noEmit
```

Si en el futuro se modifica algo dentro de `convex/`, también se debe ejecutar:

```bash
npx convex codegen
```

## Estado actual

- La landing redirige al chat desde su CTA principal.
- El chat tiene historial y prompts sugeridos en paneles laterales colapsables.
- Los mensajes del usuario y del asistente mantienen el contexto conversacional en cliente.
- La respuesta del asistente se genera desde un endpoint de servidor que puede enriquecer consultas climáticas con Open-Meteo antes de delegar la redacción a Groq.
- El asistente no consulta alertas oficiales en vivo; para emergencias debe remitir a fuentes institucionales.
