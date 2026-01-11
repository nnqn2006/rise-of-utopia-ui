<!-- Copilot instructions for AI coding agents -->
# Project-specific guidance for AI assistants

This file contains concise, actionable guidance for AI coding agents working in this repository.

- Repository tech: Vite + React + TypeScript + Tailwind (+ shadcn-ui).
- Key scripts (from `package.json`):
  - `npm run dev` — start Vite dev server (host ::, port 8080)
  - `npm run build` — production build (see `vite.config.ts`)
  - `npm run build:dev` — build in development mode
  - `npm run preview` — preview built site
  - `npm run lint` — run ESLint across the repo

- Path alias: `@` -> `src` (configured in `tsconfig.json` and `vite.config.ts`).
  - Use imports like `import X from "@/components/ui/button"` rather than relative paths.

- Project layout to reference:
  - `src/components/ui/` — shadcn-style UI primitives and wrappers (e.g. `button.tsx`, `toaster.tsx`, `sonner.tsx`).
  - `src/components/layout/` — layout pieces (sidebar, dashboard layout, mode toggle).
  - `src/pages/` — route pages (root-level pages and `farmer/`, `trader/` subfolders).
  - `src/hooks/` — custom hooks (e.g. `use-mobile.tsx`, `use-toast.ts`).
  - `src/lib/utils.ts` — shared helpers.

- Routing and code-splitting:
  - Routes are defined in `src/App.tsx` using `react-router-dom` and lazy-loaded with `React.lazy` + `Suspense`.
  - When adding a page, put it under `src/pages/` and lazy-import it in `src/App.tsx` to keep chunk sizes small.

- Global state / data fetching:
  - `@tanstack/react-query` is initialized at the app root (`QueryClientProvider` in `src/App.tsx`).
  - Follow the pattern of placing hooks and query helpers in `src/hooks` and `src/lib`.

- UI notifications: two systems are used — a custom Toaster (`src/components/ui/toaster.tsx`) and `sonner` wrapper (`src/components/ui/sonner.tsx`). Be careful not to duplicate notification responsibilities when modifying toast behavior.

- Build and bundling specifics:
  - `vite.config.ts` defines `resolve.alias` for `@` and `build.rollupOptions.output.manualChunks` (vendor chunking for react, react-query, recharts, and Radix UI). Changing large dependencies may require updating `manualChunks`.
  - A dev-only plugin `lovable-tagger` may run in development mode — avoid removing it unless you understand its effect on component tagging.

- Styling conventions:
  - Tailwind CSS + `tailwind.config.ts` is used. Components prefer utility classes and small wrappers (shadcn-ui style).
  - `class-variance-authority` (CVA) is available for variant-driven components.

- Conventions and patterns found in the codebase:
  - Files use `.tsx` for components. Prefer named exports for small UI primitives and default exports for page components.
  - UI primitives are under `src/components/ui` and should be small, reusable, and parameterized via props or CVA.
  - Keep route components focused; layout composition is handled by `components/layout/*`.

- When changing imports or path aliases:
  - Update both `tsconfig.app.json`/`tsconfig.json` (already maps `@/*` to `src/*`) and `vite.config.ts` if adding new top-level aliases.

- Developer workflows (commands):
  - Install dependencies: `npm i`
  - Start dev server: `npm run dev`
  - Build: `npm run build` or `npm run build:dev`
  - Lint: `npm run lint`

- Quick examples:
  - Add a page and route:
    1. Create `src/pages/new/Thing.tsx` (default export).
    2. Lazy-import in `src/App.tsx`: `const Thing = React.lazy(() => import("./pages/new/Thing"));`
    3. Add a `<Route path="/new/thing" element={<Thing/>} />` entry.

- What is NOT present / missing (observed):
  - No test scripts found in `package.json`. Assume tests are not part of the default workflow.

If anything here is unclear or you want more detail about a specific area (routing, build chunks, notification systems, or component patterns), tell me which area to expand and I'll iterate.
