### App description

You type or dictate quick thoughts into one universal chat box, and an LLM instantly files each note into smart categories like Tasks, Ideas, or Meetings—no manual sorting needed.
You can then browse any category as a simple list and search keywords to jump straight to the right note.
The goal is to make capturing and retrieving bite-sized knowledge as fast and friction-free as sending a message.

### Steps

0 · Repo & Tooling Bootstrap

What to ship Details LLM “vibe-coding” prompt
pnpm mono-repo apps/web, apps/edge, packages/uieslint, prettier, vitest, typescript, tailwind presets prompt\nYou are a senior JS infra engineer. Create a pnpm workspace with apps `web` (React 18 + Vite + TS) and `edge` (Deno Edge Functions). Add shared lib `@chatnotes/ui` with shadcn/ui components. Configure TypeScript path aliases, eslint (@typescript-eslint/recommended, tailwindcss plugin), prettier. Output directory tree & every config file.\n
NPM scripts only (no CI) Add in root package.json: json\n\"scripts\": {\n \"lint\": \"eslint . --ext .ts,.tsx --max-warnings 0\",\n \"test\": \"vitest run --coverage\",\n \"build\": \"pnpm -r run build\",\n \"wcag\": \"pa11y-ci --config pa11y.json\",\n \"lh\": \"lighthouse http://localhost:4173 --preset=mobile --only-categories=performance,accessibility --chrome-flags=\\\"--headless\\\"\"\n}\n plus minimal pa11y.json & LH budget file. prompt\nGenerate package.json `scripts` section exactly as listed (lint, test, build, wcag, lh). Also output `pa11y.json` for WCAG 2.1 AA with viewport 375×667 and `lighthouse-budget.json` (mobile performance, FCP ≤1500 ms, TTI ≤2000 ms). Keep devDeps minimal.\n

⸻

1 · Database (Supabase Postgres – no auth yet)

What to ship Details LLM prompt
Schema Simplify tables: drop user_id, keep one shared workspace.notes(id, category, content, source, created_at) and categories(name) seeded with the six defaults.RLS = DISABLED for v0. prompt\nWrite SQL to create Supabase tables `categories` (name text primary key) and `notes` (id uuid default uuid_generate_v4(), category text references categories, content text not null, source text default 'auto', created_at timestamptz default now()). Also insert six rows into `categories` ('task','idea','journal','meeting','reading','misc'). Provide `supabase db seed` file contents.\n

⸻

2 · Edge Functions (run on Vercel Edge)

Route Scope LLM prompt
POST /classify Body {note_id, content} → call GPT-4o with strict single-word label response, then update notes set category.OpenAI key from env. prompt\nCreate a Deno edge function (Vercel) for route POST /classify. Validate JSON {note_id, content}. Call OpenAI GPT-4o with system prompt “Classify the note content into one of: task, idea, journal, meeting, reading, misc. Reply ONLY the label.” Update Supabase row via service role key. Return {category}. Use oak server style imports.\n
POST /search Body {query} → simple full-text ILIKE search (limit 50) over content. ```prompt\nCreate POST /search edge function: parse {query}. Run Supabase RPC: select \* from notes where content ILIKE ‘%’

⸻

3 · Frontend Skeleton (mobile-only)

Feature Details LLM prompt
Vite + React app Tailwind mobile viewport (max-w-screen-sm mx-auto). Routes: / (Chat), /c/:cat (Notes list). Use shadcn/ui & React Router 6. No Zustand – stick to React context & hooks. prompt\nScaffold a Vite React 18 TS project for a mobile-only PWA. Tailwind config with `content` paths. App shell: header with brand, footer nav tabs. React Router: / (Chat) and /c/:cat (Notes). Use shadcn/ui primitives. Provide `App.tsx`, `main.tsx`, `index.html`, minimal Tailwind config.\n

⸻

4 · Chat Capture Flow

Piece Details LLM prompt
Composer Fixed bottom textarea (auto-grow) + “Send” button + category pill dropdown (default “Auto”). Submit on tap or Ctrl/⌘+Return. Optimistically add bubble. prompt\nWrite a React component <Composer/>. Mobile first. Tailwind bottom-sticky, textarea auto-grow, dropdown using shadcn/ui `Popover`. On send: call `insertNote(content, selected)` (provided via prop). Keyboard shortcut Ctrl/Cmd+Enter. Typescript.\n
Insert note hook Uses Supabase JS sdk: immediate insert notes with `source = picker	auto, then await /classify` if auto and patch SWR cache.

⸻

5 · Notes List per Category

Piece Details LLM prompt
Data fetch useSWR('/notes?category=xxx') hitting Supabase RPC. prompt\nCreate a React hook `useCategoryNotes(cat)` that fetches `/api/notes?category=cat` (proxy to supabase query) using SWR with revalidateOnFocus false.\n
Mobile table / cards Render list as swipeable cards (@use-gesture/react optional) showing first 80 chars & datetime. Tap → modal with full note. prompt\nBuild <NotesList notes={...}> that maps to shadcn/ui `Card` components stacked vertically (gap-2). Add `onClick` to open full-screen Dialog showing content. Tailwind truncate text with ellipsis. Provide full code.\n

⸻

6 · Keyword Search

Piece Details LLM prompt
Search bar Sticky top bar across screens; tap focuses input; debounce 300 ms; show dropdown of matches. On Enter navigate to cat list and scroll to note. prompt\nWrite <SearchBar/>: mobile header, input stretches 100%. Use `useDebounce` to call /search after 300 ms. Show dropdown list (shadcn/ui Command) with first 5 results; each item shows snippet + category badge. On Enter or click -> navigate(`/c/${cat}#${noteId}`) and smooth-scroll.\n

⸻

7 · Design & Accessibility Pass

What Details LLM prompt
Dark mode & motion Tailwind dark: classes, prefers-reduced-motion utilities. prompt\nAdd dark-mode classes to all components, plus `motion-safe:animate-slideIn` for new chat bubbles. Provide diff patch.\n
WCAG audit script Use pa11y-ci against pnpm preview server in mobile viewport. Fail if >0 errors. prompt\nCreate pa11y.json targeting http://localhost:4173 with viewport 375x667, WCAG2AA, ignore 'warning' level. Output JUnit report.\n

⸻

8 · Performance Budget & Lighthouse

What Details LLM prompt
LH script The lh npm script (see step 0) runs after pnpm build && pnpm preview and fails if Perf < 90 & Access < 90. prompt\nProduce `lighthouse-budget.json` for mobile: total JS ≤ 150 kB, FCP ≤ 1.5 s, TTI ≤ 2 s. Modify package.json `lh` script to `lighthouse http://localhost:4173 --budget-path=lighthouse-budget.json --quiet --chrome-flags=\\\"--headless\\\"`.\n

⸻

9 · Manual QA & Release

What Details LLM prompt
Playwright smoke Mobile emulation iPhone 14. Scenario: send note, auto classify, see in list, search & navigate. prompt\nGenerate Playwright test `e2e.spec.ts` using mobile iPhone14 viewport. Steps: launch dev server, open '/', type 'Buy milk', press send, wait list contains item, go to 'Tasks' list, assert note present, use header search 'milk', click result, expect scroll into view.\n
Vercel deploy vercel link then vercel --prebuilt --prod (manual run). prompt\nList CLI commands to deploy this repo to Vercel with edge functions. Assume env vars SUPABASE_URL, SERVICE_ROLE_KEY, OPENAI_KEY set locally and in dashboard.\n
