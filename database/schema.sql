-- Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries Table
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  stress_category TEXT NOT NULL,
  stress_confidence FLOAT NOT NULL,
  mood_emoji TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly Suggestions Table
CREATE TABLE weekly_suggestions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start TIMESTAMP NOT NULL,
  suggestions TEXT NOT NULL,
  patterns JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only read their own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can only see their own journal entries"
  ON journal_entries FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only see their own suggestions"
  ON weekly_suggestions FOR SELECT
  USING (user_id = auth.uid()::text);

-- Indexes for Performance
CREATE INDEX idx_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_suggestions_user_id ON weekly_suggestions(user_id);
CREATE INDEX idx_suggestions_created_at ON weekly_suggestions(created_at DESC);