# ChatNotes - AI-Powered Note-Taking Application

An intelligent, mobile-first note-taking app that uses AI to automatically categorize your thoughts into smart categories like Tasks, Ideas, or Meetings. Built with React, Supabase, and OpenAI.

## 🎯 Overview

ChatNotes provides a friction-less chat interface for capturing thoughts, ideas, tasks, and notes. The system automatically classifies entries into organized categories using GPT-4, enabling users to focus on content creation rather than organization.

### Core Value Proposition
- **One friction-less input**: Single chat box for all types of notes
- **Intelligent categorization**: AI automatically organizes notes into predefined categories
- **Fast retrieval**: Powerful search functionality to quickly find content
- **Mobile-first design**: Optimized for mobile use with PWA capabilities

### Target Users
1. **Busy Professionals** - Capturing meeting takeaways and todos
2. **Students/Researchers** - Storing lecture notes and article quotes  
3. **Creatives** - Collecting inspiration snippets and rough drafts

---

## ✨ Key Features

### 🤖 AI-Powered Classification
- **Auto-Categorization**: GPT-4o model classifies notes into 6 categories:
  - **Tasks** (✅) - Action items, todos, assignments
  - **Ideas** (💡) - Creative thoughts, innovations, brainstorming
  - **Journal** (📖) - Personal reflections, daily logs, experiences
  - **Meetings** (👥) - Meeting notes, discussions, decisions
  - **Reading** (📚) - Quotes, research notes, article summaries
  - **Misc** (📝) - Everything else that doesn't fit other categories
- **Manual Override**: Users can select categories manually if desired
- **Real-time Updates**: Classification happens asynchronously with UI updates

### 💬 Chat-Based Interface
- **Primary Interface**: Clean, WhatsApp-style chat interface
- **Category Selection**: Optional category picker with "Auto" as default
- **Quick Actions**: Keyboard shortcuts (⌘/Ctrl + Enter to send)
- **Mobile Optimized**: Touch-friendly interface with gesture support

### 🔍 Advanced Search
- **Global Search**: Header search bar accessible from any page
- **Real-time Results**: Debounced search with live results dropdown
- **Result Highlighting**: Visual emphasis on matching content
- **Smart Navigation**: Click-to-navigate to specific notes with smooth scrolling

### 📱 Mobile-First Design
- **Responsive**: Optimized for smartphone screens (max-width: 28rem)
- **Touch-Friendly**: Large tap targets and gesture support
- **Progressive Enhancement**: Works well across all device sizes
- **PWA Ready**: Designed for progressive web app deployment

### 🌙 Theme Support
- **System Integration**: Respects user's system theme preference
- **Manual Toggle**: Theme switcher in header
- **Consistent Experience**: All components support both themes
- **Accessibility**: Proper contrast ratios in both modes

---

## 🚀 Tech Stack

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.4.5 for fast development and optimized builds
- **Styling**: Tailwind CSS 3.3.3 for utility-first styling
- **UI Components**: Custom component library built on Radix UI primitives
- **Routing**: React Router DOM 6.15.0 for client-side navigation
- **State Management**: React built-in state + SWR 2.2.4 for server state
- **Icons**: Lucide React for consistent iconography

### Backend Stack
- **Database**: Supabase PostgreSQL with real-time capabilities
- **API Functions**: Vercel Edge Functions running on Deno runtime
- **AI Integration**: OpenAI GPT-4o for note classification
- **Authentication**: Supabase Auth (configured but not implemented in current version)
- **File Storage**: Supabase Storage (prepared for future image uploads)

### Development Tools
- **Package Manager**: PNPM with workspace support
- **Type Checking**: TypeScript 5.0.2 with strict configuration
- **Linting**: ESLint 8.45.0 with React and TypeScript rules
- **Testing**: Vitest with coverage reporting, Playwright for E2E
- **Code Quality**: Prettier for formatting, pre-commit hooks
- **Deployment**: Vercel with automatic deployments

---

## 📁 Project Structure

```
chat-notes/
├── apps/
│   ├── web/          # React frontend (Vite + TypeScript)
│   └── edge/         # Vercel Edge Functions (Deno)
├── packages/
│   └── ui/           # Shared UI component library
├── supabase/         # Database migrations and schema
│   ├── config.toml   # Local development configuration
│   ├── migrations/   # Database schema versions
│   │   └── 001_initial_schema.sql
│   └── seed.sql      # Sample data for development
├── docs/             # Documentation and specifications
└── tests/            # E2E tests
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- PNPM package manager
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repo-url>
cd chat-notes
pnpm install
```

### 2. Environment Variables

Create environment files with your credentials:

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

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not already installed)
npm i -g @supabase/cli

# Initialize and link to your project
supabase init
supabase link --project-ref YOUR_PROJECT_REF

# Push schema to your remote database
pnpm db:migrate

# Reset database with migrations and seed data
pnpm db:reset
```

#### Option B: Local Development Environment

```bash
# Start local Supabase stack
pnpm dev:supabase

# Check status and get local credentials
pnpm supabase:status

# Reset local database (if needed)
pnpm supabase:reset

# Access local dashboard
open http://localhost:54323
```

**For local development, update your environment:**
```bash
# apps/web/.env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<local_anon_key_from_supabase_status>
```

#### Option C: Manual Setup in Supabase Dashboard

1. Go to the SQL Editor in your Supabase dashboard
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/seed.sql` for sample data

### 4. Development

## Unified API Architecture

This project now uses a **single source of truth** for API endpoints - Vercel Edge Functions in `apps/edge/api/`.

### Development Commands

```bash
# 🔄 Default: Legacy Express server + Vite (stable development)
npm run dev

# 🎯 Unified: Run with Vercel dev (includes edge functions)
npm run dev:full

# 🗄️ Start local Supabase
npm run dev:supabase

# 🚀 Full development stack with edge functions
npm run dev:supabase && npm run dev:full
```

### API Endpoints

All API endpoints are served by edge functions:

- `POST /api/classify` - Enhanced classification with metadata extraction
- `POST /api/search` - Search functionality  
- `POST /api/task-completion` - Task completion toggle
- `POST /api/task-due-date` - Due date setting

### Environment Setup

**Development:**
- Vercel dev server serves edge functions locally
- Same code runs in development and production

**Production:**
- Edge functions deployed to Vercel
- Globally distributed for better performance

### Database Migrations

Required migrations for full functionality:

```sql
-- Add metadata column
ALTER TABLE notes ADD COLUMN metadata JSONB DEFAULT '{}';
CREATE INDEX idx_notes_metadata ON notes USING gin(metadata);

-- Add task completions table
CREATE TABLE task_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_task_completions_unique_note ON task_completions(note_id);
```

### Task Content Cleaning

For tasks, the system now:
- Preserves original content in `notes.content`
- Stores cleaned content in `notes.metadata.cleaned_content`
- Extracts due dates to `notes.metadata.due_date`
- Displays cleaned content in UI while preserving data integrity

### Debugging

Console logs are available in:
- **Development**: Vercel dev server terminal
- **Production**: Vercel function logs dashboard

Example log output:
```javascript
Classification result: {
  originalContent: "Fix the login bug due tomorrow",
  finalCategory: "task",
  cleanedContent: "Fix the login bug", 
  metadata: {
    due_date: "2024-12-26",
    cleaned_content: "Fix the login bug"
  }
}
```

#### 🚀 Quick Start - Run the Full Application

```bash
# Install dependencies (if not done already)
pnpm install

# Start both frontend and backend together
pnpm dev:all
```

This will start:
- **Backend API server** on `http://localhost:8080`
- **Frontend React app** on `http://localhost:5173`

#### What Each Server Does

**Backend (localhost:8080)**
- Handles AI note classification via OpenAI
- Manages search functionality
- Connects to your Supabase database
- Provides REST API endpoints:
  - `POST /api/classify` - Categorize notes with AI
  - `POST /api/search` - Search through notes
  - `GET /health` - Health check

**Frontend (localhost:5173)**
- React web application
- Automatically proxies `/api/*` calls to the backend
- Mobile-first responsive design
- Real-time note capture and categorization

#### API Flow

1. **User types a note** → Frontend captures it
2. **Note saved to database** → Direct Supabase connection
3. **Auto-categorization requested** → Frontend calls `/api/classify`
4. **Vite proxy** → Routes to `localhost:8080/api/classify`
5. **Backend processes** → Calls OpenAI → Updates Supabase
6. **Frontend updates** → Shows the categorized note

#### Manual Testing

Once both servers are running:

1. **Open** `http://localhost:5173`
2. **Type a note** like "Buy groceries tomorrow"  
3. **Select "Auto"** category
4. **Click Send**
5. **Watch** as the note gets automatically categorized as "task"

#### Alternative Development Commands

```bash
# Alternative: Individual servers
# Terminal 1: Backend only
pnpm dev:backend

# Terminal 2: Frontend only  
pnpm dev:web

# Or start individually:
pnpm dev:web          # Frontend only (localhost:5173)
pnpm dev:backend      # Backend Express server (localhost:8080)
pnpm dev:full         # Full-stack with Vercel CLI

# Database operations
pnpm db:migrate       # Push schema to remote database
pnpm db:reset         # Reset database with migrations + seed data
pnpm supabase:status  # Check Supabase status

# Quality Assurance
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm test             # Run unit tests (Vitest)
pnpm e2e              # Run E2E tests (Playwright)
pnpm a11y             # Accessibility audit
pnpm lh               # Lighthouse performance audit
```

#### Troubleshooting

If you get `Function Runtimes must have a valid version` error:
- Make sure you have the latest Vercel CLI: `npm install -g vercel@latest`
- The edge functions now have proper runtime configuration
- Try `vercel dev --debug` for more detailed error information

**404 on /api/classify**
- ✅ **Fixed**: Vite now proxies API calls to backend
- Make sure both servers are running with `pnpm dev:all`

**Backend Connection Issues**
- Check your `.env` file has correct Supabase credentials
- Verify OpenAI API key is valid
- Ensure Supabase service role key is set

**Frontend Issues**  
- Check `apps/web/.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart frontend after environment changes

---

## 🗄️ Database Schema

### Notes Table
```sql
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT REFERENCES categories(name) ON DELETE SET NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'auto',  -- 'auto' or 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
  name TEXT PRIMARY KEY  -- 'task', 'idea', 'journal', 'meeting', 'reading', 'misc'
);
```

### Optimizations
- **Indexes**: Category, creation date, and full-text search indexes
- **Constraints**: Foreign key relationships with cascade options
- **Extensions**: UUID generation and full-text search capabilities

---

## 🔌 API Architecture

### Edge Functions
Located in `apps/edge/api/`, deployed as Vercel Edge Functions:

#### 1. Classification Endpoint (`/api/classify`)
- **Input**: `{ note_id: string, content: string }`
- **Process**: Call OpenAI GPT-4o for content classification
- **Output**: `{ category: string }`
- **Side Effects**: Updates note record in database

#### 2. Search Endpoint (`/api/search`)
- **Input**: `{ query: string }`
- **Process**: PostgreSQL ILIKE search across note content
- **Output**: `{ results: Note[] }`
- **Optimization**: Limited to 50 results, ordered by recency

### Data Flow
1. **Note Creation**: Frontend → Database → Classification API → Database Update
2. **Search**: Frontend → Search API → Database Query → Frontend
3. **Real-time Updates**: Database changes via Supabase subscriptions

---

## 🚀 Deployment

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

---

## 📊 Performance & Quality

### Performance Budgets
- JavaScript bundle: ≤ 150kb
- Total resources: ≤ 500kb  
- First Contentful Paint: ≤ 1.5s
- Time to Interactive: ≤ 2.0s

### Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

### Success Metrics (v1 Goals)
- **Fast Capture**: ≤ 5 seconds from app open to note sent
- **Accurate Classification**: ≥ 85% notes in correct category
- **Fast Retrieval**: ≤ 2 seconds average search latency
- **User Retention**: ≥ 40% 7-day retention, ≥ 10 notes/user/week

---

## 🎨 Architecture Details

### Frontend Architecture

#### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── Composer.tsx     # Note input interface
│   ├── NotesList.tsx    # Note display component
│   └── SearchBar.tsx    # Global search interface
├── pages/               # Route-level components
│   ├── ChatPage.tsx     # Main chat interface
│   ├── CategoryPage.tsx # Category-specific views
│   ├── CategoriesPage.tsx # Categories overview
│   ├── SearchPage.tsx   # Search interface
│   └── SettingsPage.tsx # Settings and preferences
├── hooks/               # Custom React hooks
│   ├── useCategoryNotes.ts
│   ├── useDebounce.ts
│   └── useTheme.ts
└── lib/                 # Utilities and configurations
    └── supabase.ts      # Database client setup
```

#### State Management Strategy
- **Local State**: React useState for component-specific state
- **Server State**: SWR for data fetching, caching, and synchronization
- **Theme State**: Custom hook with localStorage persistence
- **Form State**: Controlled components with validation

### UI Component Library
Located in `packages/ui/`, provides:
- **Primitive Components**: Built on Radix UI for accessibility
- **Styled Components**: Tailwind-based styling with theme support
- **Type Safety**: Full TypeScript definitions
- **Consistency**: Standardized spacing, colors, and typography

---

## 🔒 Security Considerations

### Data Protection
- **Input Sanitization**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in escaping + CSP headers
- **Environment Secrets**: API keys stored in secure environment variables

### API Security
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: Implemented at Vercel Edge Function level
- **Authentication Ready**: Supabase Auth integration prepared
- **Service Keys**: Separate keys for different access levels

---

## 🔮 Future Enhancements

### Planned Improvements
- **Real-time Collaboration**: Multi-user editing capabilities
- **Offline Support**: Service worker for offline functionality
- **Advanced Search**: Vector search with embeddings
- **File Uploads**: Image and document attachment support
- **Export Features**: PDF, Markdown, and JSON export options

### Technical Debt Items
- **Test Coverage**: Expand unit and integration test coverage
- **Error Handling**: More comprehensive error boundary implementation
- **Performance Monitoring**: Add real-time performance tracking
- **Documentation**: API documentation with OpenAPI specifications

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Run quality checks: `pnpm lint && pnpm test && pnpm e2e`
5. Submit a pull request

---

## 📄 License

MIT