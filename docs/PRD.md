- PRD
  # A. Product Requirements Document (PRD) — **ChatNotes v1**
  | Field              | Value                                           |
  | ------------------ | ----------------------------------------------- |
  | **Product Name**   | **ChatNotes** (working title)                   |
  | **Author / Owner** | <your name / team>                              |
  | **Stakeholders**   | Product · Engineering · Design · AI/ML · Growth |
  | **Last Updated**   | 22 May 2025                                     |
  | **Version**        | 1.0 – Final (v1 scope locked)                   |
  ***
  ## 1 · Purpose & Problem Statement
  Knowledge workers juggle tasks, ideas and references across disparate apps. ChatNotes offers **one friction-less chat box** for all notes. A backend LLM classifies each entry and files it into category documents that can be searched, summarised, digested, and exported—no decision paralysis, no context switching.
  ***
  ## 2 · Goals & Success Metrics
  | Goal                | KPI / Target (v1)                                            |
  | ------------------- | ------------------------------------------------------------ |
  | **Fast capture**    | ≤ 5 s median app-open ➝ send                                 |
  | **Accurate filing** | ≥ 85 % notes in correct category (measured via manual moves) |
  | **Fast retrieval**  | ≤ 2 s average search latency                                 |
  | **Habit formation** | ≥ 40 % 7-day retention · ≥ 10 notes / user / week            |
  ***
  ## 3 · Personas
  1. **Busy Professional** – captures meeting takeaways, todos.
  2. **Student / Researcher** – dumps lecture notes, article quotes.
  3. **Creative** – stores inspiration snippets, images, rough drafts.
  ***
  ## 4 · Key Use-Cases / User Stories
  | #   | As a … | I want to …                                 | So that …                  |
  | --- | ------ | ------------------------------------------- | -------------------------- |
  | U1  | User   | type a quick note and hit **Send**          | I never lose an idea       |
  | U2  | User   | optionally pick a category before sending   | ensure correct filing      |
  | U3  | User   | move a mis-filed note in ≤2 clicks          | keep workspace tidy        |
  | U4  | User   | search "budget" from the header             | jump to the note instantly |
  | U5  | User   | open **Docs → Summary** and get a digest    | review insights fast       |
  | U6  | User   | read the **Daily Digest** page each morning | see yesterday's activity   |
  ***
  ## 5 · Functional Requirements
  ### 5.1 Capture & Input
  - **Text chat input** (React + shadcn/ui).
  - **Category Picker** pill (default **Auto**). Value overrides the classifier but is _not_ required.
  - **Attachment**: single image upload (MVP); others out-of-scope v1.
  - Shortcut **Ctrl/⌘ + ↩** sends note.
  ### 5.2 Classification & Save Flow
  1. On **Send** ➝ insert row in `notes` (Supabase) with provisional `category_id = null`.
  2. If picker = Auto ➝ enqueue `/classify` edge function (GPT-4o) ➝ update row with predicted category.
  3. If picker pre-selected ➝ skip classifier.
  4. Realtime subscription pushes updates to all open clients.
  ### 5.3 Documents (one per category)
  - Stored in `notes` table (category filter).
  - **Tabs**:
    - **Notes** (default) – shadcn `DataTable` with columns: Content (ellipsis) · CreatedAt · Final Category · Source (Auto / Picker).
    - **Summary** – markdown render of LLM-generated summary.
  - "Generate / Refresh Summary" button ➝ cache for 24 h.
  ### 5.4 Search
  - Search bar fixed in header; **Ctrl/⌘ + K** focuses.
  - Drop-down suggestions (5) ➝ full results page if Enter.
  - Result click navigates to Chat or Docs → Notes and highlights row/bubble.
  ### 5.5 Digest Page
  - Daily roll-up (local midnight) of note counts and snippets per category.
  - Trend arrows ↑ / ↓ show day-over-day volume.
  - Manual refresh button triggers re-generation with same pipeline as summaries.
  ### 5.6 Cross-Platform, Offline & Sync
  - React (Vite, TS) + shadcn/ui + Tailwind.
  - Mobile PWA wrapper.
  - Queue unsent notes with `localForage`; on reconnect flush and animate "synced" badge.