# 🗂️ Complete Supabase Setup Guide

## 📁 File Structure

```
supabase/
├── config.toml          # Local development configuration
├── migrations/          # Database schema versions
│   └── 001_initial_schema.sql
├── seed/               # Individual seed files (legacy)
│   └── 001_categories.sql
└── seed.sql            # Main seed file (new standard)

.supabaserc             # Project linking configuration
```

## 🔧 Configuration Files

### 1. `supabase/config.toml` - The Master Configuration

This file controls your local Supabase development environment:

```toml
project_id = "chat-notes"  # Local project identifier

[api]
port = 54321              # Local API server port
schemas = ["public"]      # Exposed API schemas
max_rows = 1000          # Query result limits

[auth]
site_url = "http://localhost:3000"  # Your app URL
enable_signup = true               # Allow new registrations
jwt_expiry = 3600                 # Token lifetime (1 hour)

[db]
port = 54322              # Local PostgreSQL port
major_version = 15       # PostgreSQL version (match production)

[storage]
file_size_limit = "50MiB"  # File upload limits

[edge_functions]
enabled = true  # Enable serverless functions
```

**What this enables:**

- ✅ Local PostgreSQL database
- ✅ Authentication server
- ✅ Storage server
- ✅ Edge Functions runtime
- ✅ API server with auto-generated REST/GraphQL endpoints

### 2. `.supabaserc` - Project Linking

```json
{
  "project_ref": "loxrqhuyckjrmkdddmlt"
}
```

This links your local setup to your remote Supabase project.

## 🛠️ Development Workflows

### Workflow 1: Fully Local Development

```bash
# Start complete local Supabase stack
pnpm dev:supabase
```

**What this starts:**

- ✅ PostgreSQL (localhost:54322)
- ✅ API Server (localhost:54321)
- ✅ Auth Server
- ✅ Storage Server
- ✅ Edge Functions
- ✅ Dashboard (localhost:54323)

**Environment variables for local:**

```bash
# apps/web/.env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local_anon_key_from_dashboard
```

### Workflow 2: Hybrid (Remote DB + Local API)

```bash
# Use your production database with local Express server
pnpm dev:backend
```

**Environment variables:**

```bash
# .env (for Express server)
SUPABASE_URL=https://loxrqhuyckjrmkdddmlt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# apps/web/.env (for frontend)
VITE_SUPABASE_URL=https://loxrqhuyckjrmkdddmlt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Workflow 3: Production-like (Vercel)

```bash
# Simulate production environment
pnpm dev:full
```

## 📊 Database Schema Management

### Migration Files (`supabase/migrations/`)

```sql
-- 001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categories (
    name TEXT PRIMARY KEY
);

CREATE TABLE notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT REFERENCES categories(name),
    content TEXT NOT NULL,
    source TEXT DEFAULT 'auto',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration workflow:**

```bash
# Push schema to remote database
pnpm db:migrate

# Create new migration (when you change schema)
supabase db diff --schema public > supabase/migrations/002_new_changes.sql
```

### Seed Data (`supabase/seed.sql`)

```sql
-- Sample data for development/testing
INSERT INTO categories (name) VALUES
    ('task'), ('idea'), ('journal'), ('meeting'), ('reading'), ('misc');

INSERT INTO notes (content, category, source) VALUES
    ('Buy groceries', 'task', 'manual'),
    ('Build AI app', 'idea', 'auto');
```

## 🔑 Authentication & Security

### API Keys Explained

#### 1. Anon Key (`VITE_SUPABASE_ANON_KEY`)

- 🔒 Safe for frontend (can be in browser)
- 🛡️ Respects Row Level Security (RLS)
- 🌐 Used by React app

#### 2. Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

- ⚠️ Backend only (never expose to browser)
- 🔓 Bypasses RLS (full database access)
- 🖥️ Used by Edge Functions/Express server

### Environment Setup

```bash
# Frontend (apps/web/.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (root .env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_KEY=sk-...
```

## 🚀 Quick Start Commands

### 🔧 Setup (one-time)

```bash
npm i -g @supabase/cli  # Install CLI
supabase link           # Link to your project
pnpm db:migrate         # Create tables
pnpm db:seed            # Add sample data
```

### 💻 Development (daily)

```bash
pnpm dev:supabase  # Start local stack
pnpm dev:web       # Start React app

# OR

pnpm dev:backend   # Use remote DB with local API
```

### 🛠️ Database operations

```bash
pnpm supabase:status  # Check what's running
pnpm supabase:reset   # Reset local database
supabase db diff      # See schema changes
```

## 🌐 Local vs Remote Comparison

| Aspect    | Local (`dev:supabase`) | Remote (`dev:backend`)   |
| --------- | ---------------------- | ------------------------ |
| Database  | Local PostgreSQL       | Production database      |
| Speed     | Fastest                | Network dependent        |
| Data      | Sample/test data       | Real user data           |
| Offline   | ✅ Works offline       | ❌ Needs internet        |
| Team sync | Manual sync needed     | Always in sync           |
| Safety    | ✅ Safe to experiment  | ⚠️ Can affect production |

## 🔍 Debugging & Monitoring

```bash
# Check local services
pnpm supabase:status

# View logs
supabase logs

# Access local dashboard
open http://localhost:54323

# Direct database access
psql postgresql://postgres:postgres@localhost:54322/postgres
```

---

This setup gives you maximum flexibility - you can develop completely offline, test with real data, or simulate production environments! 🎯
