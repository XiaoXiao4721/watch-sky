import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]

app = FastAPI(title="Watch Sky API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ---------- models ----------

class MovieURL(BaseModel):
    label: str
    url: str

class MovieCreate(BaseModel):
    title: str
    rating: int
    notes: Optional[str] = None
    urls: list[MovieURL] = []
    watched_at: Optional[datetime] = None

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    urls: Optional[list[MovieURL]] = None
    watched_at: Optional[datetime] = None

# ---------- auth helpers ----------

def get_supabase_user(token: str) -> dict:
    """Verify the JWT with Supabase and return the user."""
    admin_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        response = admin_client.auth.get_user(token)
        if response.user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return response.user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def get_user_client(token: str) -> Client:
    """Return a Supabase client authenticated as the calling user (respects RLS)."""
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    client.postgrest.auth(token)
    return client

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = get_supabase_user(token)
    return {"user": user, "token": token}

# ---------- movie routes ----------

@app.get("/api/movies")
async def list_movies(auth=Depends(get_current_user)):
    client = get_user_client(auth["token"])
    result = (
        client.table("watched_movies")
        .select("*")
        .order("watched_at", desc=True)
        .execute()
    )
    return result.data

@app.post("/api/movies", status_code=201)
async def add_movie(movie: MovieCreate, auth=Depends(get_current_user)):
    user_id = auth["user"].id
    client = get_user_client(auth["token"])
    payload = {
        "user_id": user_id,
        "title": movie.title,
        "rating": movie.rating,
        "notes": movie.notes,
        "urls": [u.model_dump() for u in movie.urls],
    }
    if movie.watched_at:
        payload["watched_at"] = movie.watched_at.isoformat()
    result = client.table("watched_movies").insert(payload).execute()
    return result.data[0]

@app.put("/api/movies/{movie_id}")
async def update_movie(movie_id: str, movie: MovieUpdate, auth=Depends(get_current_user)):
    client = get_user_client(auth["token"])
    payload = {k: v for k, v in movie.model_dump().items() if v is not None}
    if "urls" in payload:
        payload["urls"] = [u if isinstance(u, dict) else u.model_dump() for u in payload["urls"]]
    if "watched_at" in payload and isinstance(payload["watched_at"], datetime):
        payload["watched_at"] = payload["watched_at"].isoformat()
    result = (
        client.table("watched_movies")
        .update(payload)
        .eq("id", movie_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Movie not found")
    return result.data[0]

@app.delete("/api/movies/{movie_id}", status_code=204)
async def delete_movie(movie_id: str, auth=Depends(get_current_user)):
    client = get_user_client(auth["token"])
    client.table("watched_movies").delete().eq("id", movie_id).execute()

# ---------- static files (React build) ----------

STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "Watch Sky API — frontend not built yet"}
