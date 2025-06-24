# 🚀 Quick Start Guide

## Run the Full Application

```bash
# Install dependencies (if not done already)
pnpm install

# Start both frontend and backend together
pnpm dev:all
```

This will start:
- **Backend API server** on `http://localhost:8080`
- **Frontend React app** on `http://localhost:5173`

## What Each Server Does

### Backend (localhost:8080)
- Handles AI note classification via OpenAI
- Manages search functionality
- Connects to your Supabase database
- Provides REST API endpoints:
  - `POST /api/classify` - Categorize notes with AI
  - `POST /api/search` - Search through notes
  - `GET /health` - Health check

### Frontend (localhost:5173)
- React web application
- Automatically proxies `/api/*` calls to the backend
- Mobile-first responsive design
- Real-time note capture and categorization

## API Flow

1. **User types a note** → Frontend captures it
2. **Note saved to database** → Direct Supabase connection
3. **Auto-categorization requested** → Frontend calls `/api/classify`
4. **Vite proxy** → Routes to `localhost:8080/api/classify`
5. **Backend processes** → Calls OpenAI → Updates Supabase
6. **Frontend updates** → Shows the categorized note

## Troubleshooting

### 404 on /api/classify
- ✅ **Fixed**: Vite now proxies API calls to backend
- Make sure both servers are running with `pnpm dev:all`

### Backend Connection Issues
- Check your `.env` file has correct Supabase credentials
- Verify OpenAI API key is valid
- Ensure Supabase service role key is set

### Frontend Issues  
- Check `apps/web/.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart frontend after environment changes

## Manual Testing

Once both servers are running:

1. **Open** `http://localhost:5173`
2. **Type a note** like "Buy groceries tomorrow"  
3. **Select "Auto"** category
4. **Click Send**
5. **Watch** as the note gets automatically categorized as "task"

## Alternative: Individual Servers

```bash
# Terminal 1: Backend only
pnpm dev:backend

# Terminal 2: Frontend only  
pnpm dev:web
```

Both methods work the same way! 🎉