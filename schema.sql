-- Watch Sky - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- watched_movies table
CREATE TABLE IF NOT EXISTS watched_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10) NOT NULL,
  watched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  urls JSONB DEFAULT '[]'::jsonb NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS watched_movies_user_id_idx ON watched_movies(user_id);
CREATE INDEX IF NOT EXISTS watched_movies_watched_at_idx ON watched_movies(watched_at DESC);

-- Enable Row Level Security
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own movies
CREATE POLICY "Users can read own movies"
  ON watched_movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movies"
  ON watched_movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movies"
  ON watched_movies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own movies"
  ON watched_movies FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_watched_movies_updated_at
  BEFORE UPDATE ON watched_movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
