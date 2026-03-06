# Repository Guidelines

## Project Structure & Module Organization
This repository is a minimal Next.js 16 app using the App Router. Core UI files live in `app/`: `layout.tsx` defines global metadata and fonts, `page.tsx` is the home route, and `globals.css` contains Tailwind v4 theme tokens and global styles. Static assets live in `public/`. Root config files include `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`.

## Build, Test, and Development Commands
Use the package manager already present in the repo; `bun.lock` suggests Bun is preferred.

- `bun dev`: start the local dev server on `http://localhost:3000`.
- `bun run build`: create a production build with Next.js.
- `bun start`: serve the production build locally.
- `bun run lint`: run ESLint across the project.
- `npx tsc --noEmit`: run a standalone type check when changing TypeScript code.

## Coding Style & Naming Conventions
Write TypeScript with `strict` mode assumptions and prefer functional React components. Follow the existing style: double quotes, semicolons, and 2-space indentation in JSX/TSX. Use PascalCase for React components, camelCase for variables/functions, and kebab-case only for asset filenames when needed. Prefer the `@/*` import alias over long relative paths. Use Tailwind utility classes in components and keep reusable theme values in `app/globals.css`.

## Testing Guidelines
There is no test runner configured yet. For now, treat `bun run lint` and `npx tsc --noEmit` as the required quality gates for code changes. When adding tests, colocate them near the feature or under a `tests/` directory, and use `*.test.ts` or `*.test.tsx` naming.

## Commit & Pull Request Guidelines
The current history starts from a Create Next App scaffold commit, so keep commits short, imperative, and specific, for example: `Add hero section copy` or `Refine app metadata`. Pull requests should include a concise description, the reason for the change, manual verification steps, and screenshots for UI updates.

## Agent-Specific Notes
If a future change adds a `convex/` directory or touches files inside it, run `npx convex codegen` after the edit. Update `GUIDE.md` whenever repository conventions change so the contributor guide and project guide stay aligned.
