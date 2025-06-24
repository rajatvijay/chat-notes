-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
  name TEXT PRIMARY KEY
);

-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT REFERENCES categories(name) ON DELETE SET NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'auto',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_content ON notes USING gin(to_tsvector('english', content));