# EnvRisk

EnvRisk es una aplicación construida con Next.js para consultas y advertencias sobre riesgos medioambientales en Antioquia. La interfaz actual incluye:

- Una landing page editorial en modo claro para presentar el producto.
- Una pantalla de chat para consultas sobre deslizamientos, sismos, incendios y otras amenazas del territorio.
- Un flujo visual preparado para integrar IA generativa, aunque por ahora el chat usa respuestas locales de prueba.

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
- Los mensajes del usuario y del asistente ya funcionan con estado local.
- La respuesta del asistente aún es fija mientras no exista integración real con IA.
