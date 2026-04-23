# Repository Guide

## Purpose
This project is a small Next.js 16 App Router application with TypeScript, React 19, Tailwind CSS v4, and ESLint. The product is branded as `EnvRisk`, an Antioquia-focused generative AI app for environmental risk consultation and warnings, covering cases such as landslides, earthquakes, fires, and related territory threats. The current UI direction is a light-first editorial landing page with a minimal, institutional visual language based on Antioquia's dark green.

## Structure
- `app/`: routes, layout, and global styles.
- `app/icon.svg`: main app icon asset consumed by Next.js metadata routing.
- `app/chat/page.tsx`: chatbot experience with the same light editorial visual system as the landing.
- `public/`: static assets.
- Root configs: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`.

## Working Rules
- Use Bun commands by default because the repo includes `bun.lock`.
- For code changes, run `bun run lint` and `npx tsc --noEmit`.
- If a `convex/` directory is added or modified later, run `npx convex codegen`.
- Keep React components in TypeScript, prefer the `@/*` alias, and follow the existing formatting style.
- Preserve the current visual system unless the task requires a redesign: light backgrounds, restrained motion, serif display typography, and dark green as the primary accent.
- The app icon should keep the same editorial identity: dark green base, ivory contrast, and environmental-risk cues that stay legible at small sizes.
- The landing top bar should show the app icon alongside the `EnvRisk` wordmark to reinforce branding in the main entry point.
- The landing copy should reflect the app idea directly: generative AI support for environmental risk awareness, questions, and warnings in Antioquia, with examples such as landslides, earthquakes, and fires.
- Favor a prevention-and-guidance narrative over a generic institutional-services narrative.
- The landing header CTA `Conversemos` should route directly to `/chat`.
- Hero sections can use custom SVG illustrations stored in `public/` when API-based image generation is unavailable; keep them editorial, minimal, and aligned with the same green-and-ivory palette.
- When the landing uses imagery, prefer a separate horizontal hero gallery below the main headline instead of compressing visuals into the top text block.
- If the hero gallery behaves as a carousel, show a single large slide at a time and rotate it automatically with subtle transitions; manual dot navigation is acceptable as a secondary control.
- Implement that carousel as layered slides or another non-peeking transition so offscreen artwork never leaks into the visible white frame.
- Assets used in that carousel should be authored in a wide landscape ratio so they fill the container naturally without relying on heavy cropping.
- Keep carousel SVGs free of embedded copy or labels; all readable text should live in the HTML overlay, and the image itself should render fully inside the frame.
- Decorative SVG elements should keep safe margins from the canvas edges so circles and icons are never visually cut off.
- Chat surfaces should preserve the landing look: light canvas, soft borders, serif hierarchy, and a bottom composer with a visible attachment action using a paperclip icon.
- The chat page should fit within the viewport without page scroll; keep only the suggested prompts panel and a clean interaction surface with the composer anchored at the bottom.
- The chat now uses a local Next.js server route at `app/api/chat/route.ts` to call Groq with a vanilla conversational setup and no external live-data tools.
- Keep the initial assistant greeting `Bienvenido, ¿En qué te puedo ayudar?`, preserve the existing message styling, and send subsequent turns to Groq while maintaining conversation context.
- Configure Groq with `GROQ_API_KEY`; `GROQ_MODEL` is optional and currently defaults to `llama-3.3-70b-versatile`.
- The chat layout can use two collapsible side panels: chat history on the left and suggested prompts on the right, both independently showable and hideable around the central conversation pane.
- When both side panels are visible, the chat layout should use the full viewport width so those panels sit near the outer edges and the main conversation area keeps as much width as possible.
- Showing or hiding side panels must not push the main chat pane sideways; the center column should stay visually anchored while the side panels appear independently at the edges.
- Use icon-only controls for showing or hiding side panels, and keep those controls only in the main chat header, never duplicated inside the sidebars themselves.

## Docs To Maintain
- `AGENTS.md`: contributor-facing repository guidelines.
- `GUIDE.md`: short internal project guide that should stay updated with workflow changes.
