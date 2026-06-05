# Database Setup

PostgreSQL database on Supabase for Mental Health Tracker.

## Tables

### users
- `id` (TEXT) - Google user ID
- `email` (TEXT) - User email
- `name` (TEXT) - User full name
- `picture_url` (TEXT) - Google profile picture
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### journal_entries
- `id` (TEXT) - Unique entry ID
- `user_id` (TEXT) - Reference to users table
- `text` (TEXT) - Journal entry content
- `stress_category` (TEXT) - Detected stress category
- `stress_confidence` (FLOAT) - Confidence score (0-1)
- `mood_emoji` (TEXT) - Selected mood emoji
- `tags` (TEXT[]) - Array of tags
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### weekly_suggestions
- `id` (TEXT) - Unique suggestion ID
- `user_id` (TEXT) - Reference to users table
- `week_start` (TIMESTAMP) - Start of week
- `suggestions` (TEXT) - AI-generated suggestions
- `patterns` (JSONB) - Weekly stress patterns
- `created_at` (TIMESTAMP)

## Setup Instructions

### 1. Create Supabase Project
- Go to https://supabase.com
- Click "New Project"
- Fill in details and create

### 2. Get Credentials
- Project URL: Settings → API
- Anon Key: Settings → API → anon public

### 3. Run SQL Schema
- Go to SQL Editor
- Create new query
- Copy and paste content from `schema.sql`
- Execute

### 4. Enable RLS
All tables have RLS enabled for security.

## Row Level Security

Policies ensure users can only:
- See their own entries
- Create entries for themselves
- Delete their own entries
- View their own suggestions

## Indexes

Performance indexes on:
- `journal_entries.user_id`
- `journal_entries.created_at`
- `weekly_suggestions.user_id`
- `weekly_suggestions.created_at`

## Backups

Supabase automatically backs up data. Enable in Settings → Backup.

## Monitoring

Check:
- Database usage in Settings
- Slow queries in Logs
- Realtime connections in Realtime