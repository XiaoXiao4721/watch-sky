import { supabase } from './supabase'

export interface MovieURL {
  label: string
  url: string
}

export interface Movie {
  id: string
  user_id: string
  title: string
  rating: number
  watched_at: string
  urls: MovieURL[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MovieCreate {
  title: string
  rating: number
  notes?: string
  urls?: MovieURL[]
  watched_at?: string
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function fetchMovies(): Promise<Movie[]> {
  const headers = await authHeaders()
  const res = await fetch('/api/movies', { headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createMovie(movie: MovieCreate): Promise<Movie> {
  const headers = await authHeaders()
  const res = await fetch('/api/movies', {
    method: 'POST',
    headers,
    body: JSON.stringify(movie),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateMovie(id: string, movie: Partial<MovieCreate>): Promise<Movie> {
  const headers = await authHeaders()
  const res = await fetch(`/api/movies/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(movie),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteMovie(id: string): Promise<void> {
  const headers = await authHeaders()
  const res = await fetch(`/api/movies/${id}`, { method: 'DELETE', headers })
  if (!res.ok) throw new Error(await res.text())
}
