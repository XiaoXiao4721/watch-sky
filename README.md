# Watch Sky


Track movies you've watched — with ratings, entry timestamps, and named URLs.

**Stack:** React (Vite) + FastAPI (uvicorn) + Supabase + Google Cloud Run

## Quick Start (local dev)

### Backend
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env.local  # fill in your Supabase keys
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

## Supabase Setup

1. Create a new Supabase project.
2. Run `schema.sql` in the Supabase SQL Editor.
3. Copy your Project URL, anon key, and service role key.

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | GCP service account JSON (base64 not required — paste raw JSON) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `VITE_SUPABASE_URL` | Same as SUPABASE_URL (baked into frontend build) |
| `VITE_SUPABASE_ANON_KEY` | Same as SUPABASE_ANON_KEY (baked into frontend build) |

## Deployment

Push to `main` — GitHub Actions builds the Docker image, pushes to GCR, and deploys to Cloud Run automatically.

GCP project: `watch-sky` | Region: `asia-east1`
