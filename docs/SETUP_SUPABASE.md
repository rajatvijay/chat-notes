# Supabase Setup Instructions

## Step 1: Install Supabase CLI

```bash
npm i -g @supabase/cli
```

## Step 2: Initialize Supabase Project

```bash
# Navigate to your project
cd /Users/rajatvijay/chat-notes

# Initialize Supabase (this will create proper config.toml)
supabase init

# Link to your existing project
supabase link --project-ref loxrqhuyckjrmkdddmlt
```

When prompted for the database password, use your Supabase project's database password.

## Step 3: Pull Existing Schema (Optional)

If you want to sync your local schema with what's already in your remote database:

```bash
# Pull the current schema from remote
supabase db pull

# This will create migration files based on your existing database
```

## Step 4: Push Your Local Schema to Remote

If you want to use the schema we defined in the migration files:

```bash
# Push local migrations to remote database
supabase db push
```

## Step 5: Reset Database with Seed Data

```bash
# Reset database and apply migrations + seed data
supabase db reset

# Or just push migrations without reset
supabase db push
```

## Alternative: Manual Database Setup

If you prefer not to use the CLI for database operations, you can:

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Run the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the contents of `supabase/seed.sql`

## Development Commands

Once linked, you can use:

```bash
# Start local Supabase stack
supabase start

# Reset local database (applies migrations + seed)
supabase db reset

# Check status
supabase status

# Stop local stack
supabase stop

# View local dashboard
open http://localhost:54323
```

## Troubleshooting

### Config Parse Errors
- Delete `supabase/config.toml` and run `supabase init` to regenerate
- The CLI will create a config compatible with your CLI version

### Link Issues
- Make sure you have the correct project reference: `loxrqhuyckjrmkdddmlt`
- Ensure you have admin access to the Supabase project
- Check your internet connection

### Database Password
- Find your database password in Supabase Dashboard → Settings → Database
- Or reset it if you don't remember it