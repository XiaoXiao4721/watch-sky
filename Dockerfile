# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# Build args become Vite env vars at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ── Stage 2: Python / FastAPI runtime ─────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built React assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PORT=8080

EXPOSE 8080

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
