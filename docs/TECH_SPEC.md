- Tech Spec
  # ChatNotes — Technical Specification v1.1 (final)
  **Product version:** v1.0 (feature-complete)
  **Spec version:** 1.1 – 22 May 2025
  **Authors:** Engineering & Product
  **Approved by:** CTO / Head of Product
  ***
  ## 1 Overview
  ChatNotes is a **progressive-web application (PWA)** that lets users capture notes through a chat interface, then organises them automatically into category documents (Tasks, Ideas, Journal, Meeting, Reading, Misc). An LLM chosen by the **user** classifies and summarises notes on demand. The stack uses React, Tailwind + shadcn/ui on the front-end, Supabase for auth & Postgres storage, and **Vercel** (static hosting + Edge Functions) for deployment. No realtime/WebSocket channels are required; the client relies on optimistic UI updates and periodic polling.
  ***
  ## 2 Architecture
  ```mermaid
  flowchart LR
      subgraph Front-end (PWA)
          user[(Browser / Installable PWA)] --> app[React 18 + Vite (TS)]
      end

      app -- HTTPS --> edge[Vercel Edge Functions (API Gateway)]
      edge --> db[(Supabase Postgres + RLS)]
      edge --> auth[Supabase Auth]

      subgraph Edge Functions (Deno @ Vercel)
          classify[POST /classify] -. model_id .-> llm[Selected LLM]
          summary[POST /summary] -. model_id .-> llm
          digest[POST /digest] -. model_id .-> llm
      end
      edge --> classify
      edge --> summary
      edge --> digest

      db --> search[(pgvector + FTS)]

  ```
  _All traffic TLS 1.3; environment variables supply service keys._
  ***
  ## 3 Front-end (React + Vite)
  | Feature           | Details                                                                                                                               |
  | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
  | **UI Library**    | shadcn/ui components (Headless UI under Tailwind)                                                                                     |
  | **Routing**       | React Router 6 SPA paths: `/` Chat · `/docs/:catId` Docs · `/digest` Digest · `/settings`                                             |
  | **State / Data**  | TanStack Query for remote cache; Zustand for UI global state (sidebar, theme, selected LLM).                                          |
  | **Offline**       | `localForage` queue for unsent notes; Workbox service-worker precaches static assets & provides Network-First strategy for API calls. |
  | **Search**        | Header search box (`Ctrl/⌘ K`) – client calls `/search` RPC.                                                                          |
  | **PWA**           | `manifest.json`, 192 / 512 px icons, `display: standalone`; custom “Add to Home Screen” banner.                                       |
  | **Accessibility** | WCAG 2.1 AA; `aria-live` alerts; full keyboard flow; `prefers-reduced-motion` respected.                                              |
  ***
  ## 4 Edge Functions
  | Route              | Auth     | Body                            | Response       | Behaviour                                                                                                                       |
  | ------------------ | -------- | ------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
  | **POST /classify** | User JWT | `{note_id, content, model_id?}` | `{category}`   | Fetch `model_id` from DB (fallback env); call LLM with strict prompt; update `notes.category_id` & `model_guess`; return label. |
  | **POST /summary**  | User JWT | `{category_id, model_id?}`      | `{summary_md}` | Retrieve all notes in category; send to LLM summariser; store in `summaries`; return markdown.                                  |
  | **POST /digest**   | User JWT | `{date?, model_id?}`            | `{digest_md}`  | Generate on-demand daily digest across categories for the given date (default today); no background cron.                       |
  | **POST /search**   | User JWT | `{query}`                       | `[note]`       | Hybrid SQL: full-text + semantic (pgvector) ranking ≤ 50 rows.                                                                  |
  LLM calls use OpenAI, Anthropic or any provider whose ID is passed in `model_id` (validated against allow-list).
  ***
  ## 5 Database (Supabase Postgres)
  ### 5.1 Schema
  ```sql
  create extension if not exists "uuid-ossp";
  create extension if not exists "pgvector";

  /* per-user LLM preference */
  create table user_settings (
    user_id uuid primary key references auth.users on delete cascade,
    model_id text default 'gpt-4o' /* allow-list enforced in edge fn */
  );

  /* fixed category set per user */
  create table categories (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade,
    name text check (name in ('task','idea','journal','meeting','reading','misc')),
    created_at timestamptz default now()
  );

  create table notes (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade,
    category_id uuid references categories,
    content text not null,
    source text default 'auto',   -- auto | picker
    model_guess text,
    embedding vector(1536),       -- pgvector
    created_at timestamptz default now()
  );

  create table summaries (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade,
    category_id uuid references categories on delete cascade,
    content_md text not null,
    generated_at timestamptz default now(),
    expires_at timestamptz         -- created_at + interval '24 h'
  );

  create table digests (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade,
    date date not null,
    content_md text not null,
    generated_at timestamptz default now()
  );

  ```
  ### 5.2 Indexes & RLS
  ```sql
  alter table notes enable row level security;
  create policy user_notes_pol on notes
    for all using (auth.uid() = user_id);

  create index idx_notes_embedding on notes using ivfflat (embedding vector_l2_ops);
  create index idx_notes_fts on notes using gin (to_tsvector('english', content));

  ```
  ***
  ## 6 Data flow – Note Creation
  ```mermaid
  sequenceDiagram
      participant UI as Chat UI
      participant DB as Supabase DB
      participant EF as /classify Edge Fn
      participant LLM as Selected LLM

      UI->>DB: INSERT note (optimistic)
      UI->>EF: POST /classify {note_id, content, model_id}
      EF->>LLM: classify prompt
      LLM-->>EF: "task"
      EF->>DB: UPDATE notes SET category_id
      EF-->>UI: {category: "task"}
      UI-->UI: local cache update (no sockets)

  ```
  ***
  ## 7 Deployment & CI/CD
  | Stage                   | Action                                                                                        |
  | ----------------------- | --------------------------------------------------------------------------------------------- |
  | **CI (GitHub Actions)** | `pnpm lint` · `pnpm vitest` · build PWA (`pnpm build`)                                        |
  | **Preview**             | `vercel deploy --prebuilt` on every PR (preview URL)                                          |
  | **Prod**                | Merge ➜ `vercel deploy --prebuilt --prod` + `supabase db push`                                |
  | **Env vars**            | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_KEY`, `MODEL_LIST` etc. stored in Vercel Secrets |
  ***
  ## 8 Performance & Quality Targets
  | Layer        | Metric                         | Target               |
  | ------------ | ------------------------------ | -------------------- |
  | PWA          | Lighthouse PWA score           | ≥ 90                 |
  | Chat bundle  | JS ≤ 120 kB gz                 | cold FCP < 1.5 s 4 G |
  | `/classify`  | p95 latency                    | ≤ 800 ms             |
  | `/search`    | p95 latency                    | ≤ 400 ms             |
  | Error budget | FE Sentry < 1 % error sessions | monthly              |
  ***
  ## 9 Security & Compliance
  - TLS 1.3, HSTS
  - Supabase RLS on every table (`auth.uid()` match)
  - XSS sanitisation (`DOMPurify`) for markdown output
  - Secrets in Vercel; no keys in client bundle
  - GDPR / CCPA export & delete endpoints
  - Model allow-list to prevent arbitrary provider abuse
  ***
  ## 10 Open Items
  | #   | Topic                             | Owner   | Due  |
  | --- | --------------------------------- | ------- | ---- |
  | 1   | Undo-toast vs. Edit-only recovery | Design  | v1.1 |
  | 2   | Summary manual edit/versioning    | Product | v1.1 |
  | 3   | Mobile swipe actions library POC  | FE Lead | v1.1 |
  ***
  ## 11 Appendix A – Service-worker (Workbox snippet)
  ```
  import { precacheAndRoute, registerRoute } from 'workbox-precaching';
  import { NetworkFirst, CacheFirst } from 'workbox-strategies';

  precacheAndRoute(self.__WB_MANIFEST);

  registerRoute(
    ({url}) => url.pathname.startsWith('/api/'),
    new NetworkFirst({ cacheName: 'api-cache', networkTimeoutSeconds: 5 })
  );

  registerRoute(
    ({request}) => request.destination === 'image',
    new CacheFirst({ cacheName: 'img-cache', plugins: [...] })
  );

  ```
