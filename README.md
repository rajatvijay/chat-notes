# Chat Notes

A mobile-first note-taking app that uses AI to automatically categorize your thoughts into smart categories like Tasks, Ideas, or Meetings. Built with React, Supabase, and OpenAI.

## Features

- 📝 **Quick Capture**: Type or dictate notes into a universal chat interface
- 🤖 **Smart Categorization**: AI automatically files notes into categories (Tasks, Ideas, Journal, Meetings, Reading, Misc)
- 🔍 **Instant Search**: Find any note quickly with keyword search
- 📱 **Mobile-First**: Optimized for mobile devices with responsive design
- 🌙 **Dark Mode**: Full dark mode support with system preference detection
- ♿ **Accessible**: WCAG 2.1 AA compliant
- ⚡ **Fast**: Performance-optimized with Lighthouse budgets

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Deno Edge Functions (Vercel Edge Runtime)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Testing**: Playwright, Vitest
- **Linting**: ESLint, Prettier
- **Accessibility**: pa11y-ci
- **Performance**: Lighthouse CI

## Project Structure

```
chat-notes/
├── apps/
│   ├── web/           # React frontend
│   └── edge/          # Deno edge functions
├── packages/
│   └── ui/            # Shared UI components
├── supabase/
│   ├── migrations/    # Database schema
│   └── seed/          # Initial data
└── tests/             # E2E tests
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repo-url>
cd chat-notes
pnpm install
```

### 2. Environment Variables

Copy environment files and fill in your credentials:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
```

**Root `.env`:**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_KEY=your_openai_api_key
```

**`apps/web/.env`:**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI (if not already installed)
npm i -g @supabase/cli

# Link to your project (uses .supabaserc)
supabase link

# Push schema to your remote database
pnpm db:migrate

# Reset database with migrations and seed data
pnpm db:reset
```

**Option B: Manual setup in Supabase Dashboard**

Run the SQL files manually in your Supabase dashboard:
1. Go to the SQL Editor in your Supabase dashboard
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/seed.sql` for sample data

**Option C: Local development with Supabase**

```bash
# Start local Supabase instance
pnpm dev:supabase

# Check status
pnpm supabase:status

# Reset database (if needed)
pnpm supabase:reset
```

### 4. Development

```bash
# Install dependencies
pnpm install

# Start both frontend and backend (recommended)
pnpm dev:all

# Or start individually:
# Terminal 1: Backend server
pnpm dev:backend

# Terminal 2: Frontend web app  
pnpm dev:web

# Run tests
pnpm -w test      # Unit tests (Vitest)
pnpm -w e2e       # E2E tests (Playwright)
pnpm -w lint      # Linting (ESLint)
pnpm -w a11y      # Accessibility audit
pnpm -w lh        # Performance audit
```

**Important**: The frontend (localhost:5173) is configured to proxy API calls to the backend (localhost:8080). Make sure both are running for full functionality.

## Deployment

### Vercel Deployment

1. **Link project to Vercel:**
   ```bash
   vercel link
   ```

2. **Set environment variables in Vercel dashboard:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` 
   - `OPENAI_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Deploy:**
   ```bash
   vercel --prebuilt --prod
   ```

## Usage

1. **Capture Notes**: Type anything into the chat interface
2. **Auto-Categorization**: Select "Auto" to let AI categorize your note
3. **Manual Categories**: Choose a specific category for manual filing
4. **Browse Categories**: Use bottom navigation to view notes by category
5. **Search**: Use the search bar to find specific notes instantly
6. **Dark Mode**: Toggle with the moon/sun icon in the header

## Architecture

### Frontend (React App)
- Mobile-first responsive design (max-width: 428px)
- React Router for navigation
- SWR for data fetching and caching
- Tailwind CSS for styling
- TypeScript for type safety

### Backend (Edge Functions)
- **POST /api/classify**: Categorizes notes using OpenAI GPT-4o
- **POST /api/search**: Full-text search across all notes
- Deployed as Vercel Edge Functions for global performance

### Database (Supabase)
- `categories`: Predefined note categories
- `notes`: User notes with content, category, and metadata
- Full-text search indexes for fast querying
- Row Level Security disabled for MVP (single workspace)

## Development Scripts

```bash
# Development
pnpm dev:all          # Start both frontend + backend (recommended)
pnpm dev:web          # Start frontend only (localhost:5173)
pnpm dev:backend      # Start backend Express server (localhost:8080)
pnpm dev:full         # Start with Vercel CLI (full-stack)
pnpm dev:supabase     # Start local Supabase instance

# Database
pnpm db:migrate       # Push schema to remote database
pnpm db:reset         # Reset database with migrations + seed data
pnpm supabase:status  # Check Supabase status
pnpm supabase:reset   # Reset local database

# Quality Assurance
pnpm build            # Build for production
pnpm -w lint          # Run ESLint
pnpm -w test          # Run unit tests (Vitest)
pnpm -w e2e           # Run E2E tests (Playwright)
pnpm -w a11y          # Accessibility audit
pnpm -w lh            # Lighthouse performance audit
pnpm preview          # Preview production build
```

## Performance Budgets

- JavaScript bundle: ≤ 150kb
- Total resources: ≤ 500kb  
- First Contentful Paint: ≤ 1.5s
- Time to Interactive: ≤ 2.0s

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Run quality checks: `pnpm lint && pnpm test && pnpm e2e`
5. Submit a pull request

## License

MIT