# ZeBridge Database Documentation

**Version:** 1.0  
**Last Updated:** July 2, 2026  
**Database:** PostgreSQL (Supabase)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Setup Guide](#quick-setup-guide)
3. [Schema Overview](#schema-overview)
4. [Table Definitions](#table-definitions)
5. [Functions & Triggers](#functions--triggers)
6. [Storage Buckets](#storage-buckets)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Indexes](#indexes)
9. [Seed Data](#seed-data)
10. [Migrations](#migrations)
11. [Backup & Recovery](#backup--recovery)
12. [Troubleshooting](#troubleshooting)

---

## Overview

ZeBridge uses **Supabase** (PostgreSQL) as its primary database. The database stores:

- User accounts and plans
- API keys for authentication
- Tool definitions and metadata
- Execution history and results
- File references and metadata
- Usage statistics and analytics

### Database Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Project                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PostgreSQL Database                                     │
│  ├── auth.users (Supabase managed)                      │
│  ├── public.users (Extended user data)                  │
│  ├── public.api_keys                                     │
│  ├── public.tools                                        │
│  ├── public.executions                                   │
│  ├── public.files                                        │
│  └── public.usage                                        │
│                                                          │
│  Storage Buckets                                         │
│  ├── uploads (User input files)                         │
│  ├── outputs (Generated files)                          │
│  └── temp (Temporary files)                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Setup Guide

### Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Create Project**: Create a new Supabase project
3. **Get Credentials**: Copy your project URL and keys

### Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Setup Steps

1. Run all SQL commands from [Table Definitions](#table-definitions)
2. Create storage buckets from [Storage Buckets](#storage-buckets)
3. Insert seed data from [Seed Data](#seed-data)
4. Verify setup with health check: `GET /health`

---


## Schema Overview

### Entity Relationship Diagram

```
┌──────────────┐
│  auth.users  │ (Supabase managed)
└──────┬───────┘
       │
       │ 1:1
       ▼
┌──────────────┐       1:N        ┌──────────────┐
│ public.users ├──────────────────► api_keys     │
└──────┬───────┘                   └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐       N:1        ┌──────────────┐
│  executions  ├──────────────────►    tools     │
└──────┬───────┘                   └──────────────┘
       │
       ├─────── 1:N ───────┐
       │                   ▼
       │            ┌──────────────┐
       │            │    files     │
       │            └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│    usage     │
└──────────────┘
```

### Table Summary

| Table | Purpose | Primary Key | Foreign Keys |
|-------|---------|-------------|--------------|
| `users` | Extended user profile data | `id` | `auth.users(id)` |
| `api_keys` | API authentication tokens | `id` | `users(id)` |
| `tools` | Tool definitions and schemas | `id` | None |
| `executions` | Tool execution records | `id` | `users(id)`, `tools(id)` |
| `files` | File metadata | `id` | `executions(id)` |
| `usage` | Monthly usage tracking | `id` | `users(id)` |

---


## Table Definitions

### 1. Users Table

**Purpose:** Extends Supabase's `auth.users` table with application-specific data.

**SQL:**

```sql
-- Create users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for plan queries
CREATE INDEX idx_users_plan ON public.users(plan);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own data
CREATE POLICY "Users can read own data" 
ON public.users
FOR SELECT 
USING (auth.uid() = id);

-- RLS Policy: Users can update their own data
CREATE POLICY "Users can update own data" 
ON public.users
FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | - | User ID (references auth.users) |
| `plan` | TEXT | No | 'free' | Subscription plan |
| `created_at` | TIMESTAMPTZ | No | NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | NOW() | Last update timestamp |

**Valid Plans:** `free`, `pro`, `team`, `enterprise`

---


### 2. API Keys Table

**Purpose:** Stores hashed API keys for authentication.

**SQL:**

```sql
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT name_not_empty CHECK (length(name) > 0)
);

-- Create indexes
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON public.api_keys(prefix);

-- Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own API keys" 
ON public.api_keys
FOR ALL 
USING (auth.uid() = user_id);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Unique key ID |
| `user_id` | UUID | No | - | Owner user ID |
| `name` | TEXT | No | - | Human-readable key name |
| `key_hash` | TEXT | No | - | SHA-256 hash of API key |
| `prefix` | TEXT | No | - | First 10 chars (for display) |
| `created_at` | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| `last_used_at` | TIMESTAMPTZ | Yes | NULL | Last usage timestamp |
| `revoked_at` | TIMESTAMPTZ | Yes | NULL | Revocation timestamp |

**Notes:**
- API keys are stored as SHA-256 hashes
- Prefix format: `zbr_` followed by 64 hex characters
- Never store plain text API keys

---


### 3. Tools Table

**Purpose:** Stores tool definitions, schemas, and metadata.

**SQL:**

```sql
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  input_schema JSONB NOT NULL,
  output_schema JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT category_not_empty CHECK (length(category) > 0)
);

-- Create indexes
CREATE INDEX idx_tools_slug ON public.tools(slug);
CREATE INDEX idx_tools_category ON public.tools(category);
CREATE INDEX idx_tools_enabled ON public.tools(enabled) WHERE enabled = true;

-- Enable Row Level Security
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access for enabled tools
CREATE POLICY "Anyone can read enabled tools" 
ON public.tools
FOR SELECT 
USING (enabled = true);

-- RLS Policy: Only service role can modify
CREATE POLICY "Only admins can modify tools" 
ON public.tools
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Update timestamp trigger
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Unique tool ID |
| `slug` | TEXT | No | - | URL-friendly identifier |
| `name` | TEXT | No | - | Display name |
| `description` | TEXT | Yes | NULL | Tool description |
| `category` | TEXT | No | - | Tool category |
| `enabled` | BOOLEAN | No | true | Active status |
| `version` | TEXT | No | '1.0.0' | Tool version |
| `input_schema` | JSONB | No | - | JSON schema for inputs |
| `output_schema` | JSONB | Yes | NULL | JSON schema for outputs |
| `created_at` | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | NOW() | Last update timestamp |

**Categories:** `PDF`, `Image`, `AI`, `Utility`, `Office`, `Data`

---


### 4. Executions Table

**Purpose:** Records all tool execution attempts, results, and performance metrics.

**SQL:**

```sql
CREATE TABLE public.executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES public.tools(id) ON DELETE RESTRICT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input JSONB NOT NULL,
  output JSONB,
  error TEXT,
  duration INTEGER,
  tokens_used INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT duration_positive CHECK (duration IS NULL OR duration >= 0),
  CONSTRAINT tokens_positive CHECK (tokens_used IS NULL OR tokens_used >= 0)
);

-- Create indexes
CREATE INDEX idx_executions_user_id ON public.executions(user_id);
CREATE INDEX idx_executions_tool_id ON public.executions(tool_id);
CREATE INDEX idx_executions_status ON public.executions(status);
CREATE INDEX idx_executions_created_at ON public.executions(created_at DESC);
CREATE INDEX idx_executions_user_created ON public.executions(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own executions
CREATE POLICY "Users can read own executions" 
ON public.executions
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert own executions
CREATE POLICY "Users can insert own executions" 
ON public.executions
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Service role can update
CREATE POLICY "Service role can update executions" 
ON public.executions
FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'service_role');
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Unique execution ID |
| `user_id` | UUID | No | - | User who ran the tool |
| `tool_id` | UUID | No | - | Tool that was executed |
| `status` | TEXT | No | 'pending' | Execution status |
| `input` | JSONB | No | - | Tool input parameters |
| `output` | JSONB | Yes | NULL | Tool output data |
| `error` | TEXT | Yes | NULL | Error message if failed |
| `duration` | INTEGER | Yes | NULL | Execution time (ms) |
| `tokens_used` | INTEGER | Yes | NULL | AI tokens consumed |
| `metadata` | JSONB | No | {} | Additional metadata |
| `created_at` | TIMESTAMPTZ | No | NOW() | Start timestamp |
| `completed_at` | TIMESTAMPTZ | Yes | NULL | Completion timestamp |

**Valid Statuses:** `pending`, `processing`, `completed`, `failed`

---


### 5. Files Table

**Purpose:** Tracks file metadata for inputs and outputs.

**SQL:**

```sql
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.executions(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('input', 'output')),
  path TEXT NOT NULL,
  size BIGINT NOT NULL CHECK (size > 0),
  mime_type TEXT NOT NULL,
  checksum TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT path_not_empty CHECK (length(path) > 0),
  CONSTRAINT mime_format CHECK (mime_type ~ '^[a-z]+/[a-z0-9\-\+\.]+$')
);

-- Create indexes
CREATE INDEX idx_files_execution_id ON public.files(execution_id);
CREATE INDEX idx_files_type ON public.files(type);
CREATE INDEX idx_files_created_at ON public.files(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read files from own executions
CREATE POLICY "Users can read files from own executions" 
ON public.files
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.executions 
    WHERE executions.id = files.execution_id 
    AND executions.user_id = auth.uid()
  )
);

-- RLS Policy: Service role can insert/update
CREATE POLICY "Service role can manage files" 
ON public.files
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Unique file ID |
| `execution_id` | UUID | No | - | Associated execution |
| `type` | TEXT | No | - | File type (input/output) |
| `path` | TEXT | No | - | Storage path |
| `size` | BIGINT | No | - | File size in bytes |
| `mime_type` | TEXT | No | - | MIME type |
| `checksum` | TEXT | Yes | NULL | File checksum (SHA-256) |
| `created_at` | TIMESTAMPTZ | No | NOW() | Upload timestamp |

**Valid Types:** `input`, `output`

---


### 6. Usage Table

**Purpose:** Tracks monthly resource usage per user.

**SQL:**

```sql
CREATE TABLE public.usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  requests INTEGER DEFAULT 0 CHECK (requests >= 0),
  storage_bytes BIGINT DEFAULT 0 CHECK (storage_bytes >= 0),
  bandwidth_bytes BIGINT DEFAULT 0 CHECK (bandwidth_bytes >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Create indexes
CREATE INDEX idx_usage_user_month ON public.usage(user_id, month DESC);
CREATE INDEX idx_usage_month ON public.usage(month DESC);

-- Enable Row Level Security
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own usage
CREATE POLICY "Users can read own usage" 
ON public.usage
FOR SELECT 
USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE TRIGGER update_usage_updated_at
  BEFORE UPDATE ON public.usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | Unique record ID |
| `user_id` | UUID | No | - | User ID |
| `month` | DATE | No | - | Usage month (first day) |
| `requests` | INTEGER | No | 0 | API requests count |
| `storage_bytes` | BIGINT | No | 0 | Storage used (bytes) |
| `bandwidth_bytes` | BIGINT | No | 0 | Bandwidth used (bytes) |
| `created_at` | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | NOW() | Last update timestamp |

---


## Functions & Triggers

### 1. Increment Usage Function

**Purpose:** Atomically increment usage counters (for rate limiting).

```sql
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_month DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage (user_id, month, requests)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET 
    requests = public.usage.requests + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_usage TO service_role;
```

### 2. Update Storage Usage Function

**Purpose:** Calculate and update storage usage.

```sql
CREATE OR REPLACE FUNCTION update_storage_usage(
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  total_size BIGINT;
  current_month DATE;
BEGIN
  -- Calculate total storage
  SELECT COALESCE(SUM(f.size), 0) INTO total_size
  FROM public.files f
  INNER JOIN public.executions e ON e.id = f.execution_id
  WHERE e.user_id = p_user_id;
  
  -- Get current month
  current_month := DATE_TRUNC('month', NOW())::DATE;
  
  -- Update usage
  INSERT INTO public.usage (user_id, month, storage_bytes)
  VALUES (p_user_id, current_month, total_size)
  ON CONFLICT (user_id, month)
  DO UPDATE SET 
    storage_bytes = total_size,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_storage_usage TO service_role;
```

### 3. Clean Old Executions Function

**Purpose:** Archive or delete old execution records.

```sql
CREATE OR REPLACE FUNCTION clean_old_executions(
  days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.executions
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
  AND status IN ('completed', 'failed')
  RETURNING id INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION clean_old_executions TO service_role;
```

### 4. Get User Statistics Function

**Purpose:** Aggregate user statistics.

```sql
CREATE OR REPLACE FUNCTION get_user_stats(
  p_user_id UUID
)
RETURNS TABLE (
  total_executions BIGINT,
  successful_executions BIGINT,
  failed_executions BIGINT,
  total_duration_ms BIGINT,
  avg_duration_ms NUMERIC,
  total_storage_bytes BIGINT,
  api_keys_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(e.id) as total_executions,
    COUNT(e.id) FILTER (WHERE e.status = 'completed') as successful_executions,
    COUNT(e.id) FILTER (WHERE e.status = 'failed') as failed_executions,
    COALESCE(SUM(e.duration), 0) as total_duration_ms,
    COALESCE(AVG(e.duration), 0) as avg_duration_ms,
    COALESCE(SUM(f.size), 0) as total_storage_bytes,
    (SELECT COUNT(*) FROM public.api_keys WHERE user_id = p_user_id AND revoked_at IS NULL) as api_keys_count
  FROM public.executions e
  LEFT JOIN public.files f ON f.execution_id = e.id
  WHERE e.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;
```

---


## Storage Buckets

### Bucket Configuration

ZeBridge uses three storage buckets:

#### 1. Uploads Bucket

**Name:** `uploads`  
**Public:** No  
**Purpose:** User-uploaded input files

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false);

-- Upload policy
CREATE POLICY "Users can upload own files" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Read policy
CREATE POLICY "Users can read own uploads" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Delete policy
CREATE POLICY "Users can delete own uploads" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Path Structure:** `{user_id}/{execution_id}/{filename}`

#### 2. Outputs Bucket

**Name:** `outputs`  
**Public:** No  
**Purpose:** Generated output files

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('outputs', 'outputs', false);

-- Service role can insert
CREATE POLICY "Service role can insert outputs" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'outputs'
  AND auth.jwt() ->> 'role' = 'service_role'
);

-- Users can read own outputs
CREATE POLICY "Users can read own outputs" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'outputs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete own outputs
CREATE POLICY "Users can delete own outputs" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'outputs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Path Structure:** `{user_id}/{execution_id}/{filename}`

#### 3. Temp Bucket

**Name:** `temp`  
**Public:** No  
**Purpose:** Temporary files (auto-cleanup after 1 hour)

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('temp', 'temp', false);

-- Users can manage temp files
CREATE POLICY "Users can manage temp files" 
ON storage.objects
FOR ALL 
USING (
  bucket_id = 'temp' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Path Structure:** `{user_id}/{timestamp}/{filename}`

**Auto-cleanup:** Files older than 1 hour are deleted by the cleanup service.

---


## Row Level Security (RLS)

### RLS Overview

All tables have Row Level Security enabled to ensure data isolation between users.

### Policy Summary

| Table | Policy | Action | Rule |
|-------|--------|--------|------|
| `users` | Read own data | SELECT | `auth.uid() = id` |
| `users` | Update own data | UPDATE | `auth.uid() = id` |
| `api_keys` | Manage own keys | ALL | `auth.uid() = user_id` |
| `tools` | Read enabled | SELECT | `enabled = true` |
| `tools` | Admin modify | ALL | Service role only |
| `executions` | Read own | SELECT | `auth.uid() = user_id` |
| `executions` | Insert own | INSERT | `auth.uid() = user_id` |
| `executions` | Update | UPDATE | Service role only |
| `files` | Read own | SELECT | Via executions join |
| `files` | Manage | ALL | Service role only |
| `usage` | Read own | SELECT | `auth.uid() = user_id` |

### Security Best Practices

1. **Never disable RLS** on production tables
2. **Use service role** for admin operations
3. **Test policies** with different user contexts
4. **Audit regularly** for security issues

### Testing RLS Policies

```sql
-- Test as specific user
SET request.jwt.claims.sub TO 'user-uuid-here';

-- Test query
SELECT * FROM executions;

-- Reset
RESET request.jwt.claims.sub;
```

---


## Indexes

### Purpose of Indexes

Indexes improve query performance for common access patterns.

### Index Summary

| Table | Index Name | Columns | Purpose |
|-------|-----------|---------|---------|
| `users` | `idx_users_plan` | plan | Filter by plan type |
| `api_keys` | `idx_api_keys_user_id` | user_id | User's keys lookup |
| `api_keys` | `idx_api_keys_key_hash` | key_hash | Auth validation |
| `api_keys` | `idx_api_keys_prefix` | prefix | Display matching |
| `tools` | `idx_tools_slug` | slug | URL routing |
| `tools` | `idx_tools_category` | category | Category filtering |
| `tools` | `idx_tools_enabled` | enabled | Active tools only |
| `executions` | `idx_executions_user_id` | user_id | User's history |
| `executions` | `idx_executions_tool_id` | tool_id | Tool usage stats |
| `executions` | `idx_executions_status` | status | Status filtering |
| `executions` | `idx_executions_created_at` | created_at DESC | Recent first |
| `executions` | `idx_executions_user_created` | user_id, created_at DESC | User timeline |
| `files` | `idx_files_execution_id` | execution_id | Execution files |
| `files` | `idx_files_type` | type | Input/output filter |
| `files` | `idx_files_created_at` | created_at DESC | Recent files |
| `usage` | `idx_usage_user_month` | user_id, month DESC | User usage history |
| `usage` | `idx_usage_month` | month DESC | Global usage stats |

### Creating Additional Indexes

If you notice slow queries, you can add indexes:

```sql
-- Example: Index for filtering failed executions by user
CREATE INDEX idx_executions_user_failed 
ON public.executions(user_id, created_at DESC) 
WHERE status = 'failed';

-- Example: Index for tool popularity
CREATE INDEX idx_executions_tool_completed 
ON public.executions(tool_id, created_at DESC) 
WHERE status = 'completed';
```

### Monitoring Index Usage

```sql
-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexname NOT LIKE '%_pkey';
```

---


## Seed Data

### Initial Tools

Insert the core tool definitions:

```sql
INSERT INTO public.tools (slug, name, description, category, enabled, input_schema, output_schema) VALUES

-- PDF Tools
('pdf-merge', 'PDF Merge', 'Merge multiple PDF files into a single document', 'PDF', true,
 '{"type":"object","required":["pdfUrls"],"properties":{"pdfUrls":{"type":"array","minItems":2,"maxItems":10,"items":{"type":"string","format":"uri"}},"outputFilename":{"type":"string"}}}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"},"filename":{"type":"string"},"pageCount":{"type":"integer"}}}'),

('pdf-split', 'PDF Split', 'Split a PDF into individual pages or ranges', 'PDF', true,
 '{"type":"object","required":["pdfUrl"],"properties":{"pdfUrl":{"type":"string","format":"uri"},"ranges":{"type":"array","items":{"type":"object","properties":{"start":{"type":"integer"},"end":{"type":"integer"}}}}}}',
 '{"type":"object","properties":{"files":{"type":"array"}}}'),

('pdf-to-word', 'PDF to Word', 'Convert PDF documents to DOCX format', 'PDF', true,
 '{"type":"object","required":["pdfUrl"],"properties":{"pdfUrl":{"type":"string","format":"uri"},"preserveFormatting":{"type":"boolean","default":true}}}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"}}}'),

('pdf-compress', 'PDF Compress', 'Reduce PDF file size while maintaining quality', 'PDF', true,
 '{"type":"object","required":["pdfUrl"],"properties":{"pdfUrl":{"type":"string","format":"uri"},"quality":{"type":"string","enum":["low","medium","high"]}}}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"},"compressionRatio":{"type":"string"}}}'),

-- Image Tools
('remove-background', 'Remove Background', 'Remove background from images using AI', 'Image', true,
 '{"type":"object","properties":{"imageUrl":{"type":"string","format":"uri"},"imageBase64":{"type":"string"},"outputFormat":{"type":"string","enum":["png","webp"],"default":"png"}},"oneOf":[{"required":["imageUrl"]},{"required":["imageBase64"]}]}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"}}}'),

('image-upscale', 'Image Upscale', 'Upscale image resolution using AI', 'Image', true,
 '{"type":"object","required":["imageUrl"],"properties":{"imageUrl":{"type":"string","format":"uri"},"scaleFactor":{"type":"string","enum":["2x","4x"],"default":"2x"}}}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"},"originalSize":{"type":"object"},"newSize":{"type":"object"}}}'),

('image-compress', 'Image Compress', 'Compress images to reduce file size', 'Image', true,
 '{"type":"object","required":["imageUrl"],"properties":{"imageUrl":{"type":"string","format":"uri"},"quality":{"type":"integer","minimum":1,"maximum":100,"default":80}}}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"},"compressionRatio":{"type":"string"}}}'),

-- AI Tools
('generate-qrcode', 'Generate QR Code', 'Create QR codes from text or URLs', 'Utility', true,
 '{"type":"object","required":["data"],"properties":{"data":{"type":"string"},"size":{"type":"integer","minimum":64,"maximum":1024,"default":256}}}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"}}}'),

('ocr-extract-text', 'OCR Text Extraction', 'Extract text from images using OCR', 'AI', true,
 '{"type":"object","required":["imageUrl"],"properties":{"imageUrl":{"type":"string","format":"uri"},"language":{"type":"string","default":"eng"}}}',
 '{"type":"object","properties":{"text":{"type":"string"}}}'),

('generate-invoice', 'Generate Invoice', 'Create professional PDF invoices', 'AI', true,
 '{"type":"object","required":["invoiceNumber","date","from","to","items"],"properties":{"invoiceNumber":{"type":"string"},"date":{"type":"string"},"from":{"type":"object"},"to":{"type":"object"},"items":{"type":"array"},"currency":{"type":"string","default":"USD"}}}',
 '{"type":"object","properties":{"outputUrl":{"type":"string"}}}');
```

### Test User (Development Only)

For development/testing, create a test user:

```sql
-- This should only be done in development
-- In production, users sign up through the application

-- Create auth user (use Supabase dashboard or auth.users insert)
-- Then the trigger will automatically create the public.users record
```

---


## Migrations

### Migration Strategy

ZeBridge uses **sequential migrations** for database changes.

### Migration File Structure

```
zebridge/
├── supabase/
│   └── migrations/
│       ├── 20260702000001_initial_schema.sql
│       ├── 20260702000002_add_tools.sql
│       ├── 20260702000003_add_storage_policies.sql
│       └── ...
```

### Creating a Migration

1. Create new migration file with timestamp:

```bash
# Format: YYYYMMDDHHMMSS_description.sql
touch supabase/migrations/20260702120000_add_new_feature.sql
```

2. Write migration SQL:

```sql
-- Migration: Add new feature
-- Created: 2026-07-02

BEGIN;

-- Your changes here
ALTER TABLE public.tools ADD COLUMN new_field TEXT;

COMMIT;
```

3. Apply migration:

```bash
# Using Supabase CLI
supabase db push

# Or run directly in SQL editor
```

### Rollback Strategy

Always include rollback instructions:

```sql
-- Migration: 20260702120000_add_new_feature.sql

-- UP Migration
ALTER TABLE public.tools ADD COLUMN new_field TEXT;

-- DOWN Migration (add as comment)
-- ALTER TABLE public.tools DROP COLUMN new_field;
```

### Migration Best Practices

1. **Always use transactions** (`BEGIN`/`COMMIT`)
2. **Test migrations** on development first
3. **Backup before migration** in production
4. **One change per migration** when possible
5. **Document breaking changes** clearly
6. **Include rollback steps** in comments

---


## Backup & Recovery

### Automated Backups

Supabase provides automated daily backups:

- **Free tier**: 7 days of daily backups
- **Pro tier**: 30 days of daily backups + point-in-time recovery

### Manual Backup

#### Using Supabase Dashboard

1. Go to Database → Backups
2. Click "Create Backup"
3. Download backup file

#### Using pg_dump

```bash
# Backup entire database
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f zebridge_backup_$(date +%Y%m%d).dump

# Backup specific tables
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -t public.users \
  -t public.executions \
  -F c \
  -f zebridge_tables_backup.dump
```

### Restore from Backup

```bash
# Restore from dump file
pg_restore -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  zebridge_backup_20260702.dump
```

### Backup Strategy

**Recommended Schedule:**

- **Hourly**: Point-in-time recovery (Pro tier)
- **Daily**: Full database backup
- **Weekly**: Export to external storage
- **Monthly**: Long-term archive

### Data Retention Policy

| Data Type | Retention Period | Action After |
|-----------|------------------|--------------|
| Active executions | Indefinite | Keep |
| Completed executions | 90 days | Archive |
| Failed executions | 30 days | Delete |
| Temp files | 1 hour | Delete |
| User data | Indefinite | Keep until account deletion |

### Implementing Cleanup

```sql
-- Schedule with pg_cron (if available)
SELECT cron.schedule(
  'cleanup-old-executions',
  '0 2 * * *', -- Run at 2 AM daily
  'SELECT clean_old_executions(90);'
);
```

---


## Troubleshooting

### Common Issues

#### 1. Connection Errors

**Problem:** Cannot connect to database

**Solution:**

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
```

#### 2. RLS Policy Errors

**Problem:** "new row violates row-level security policy"

**Solution:**

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Temporarily disable for debugging (dev only!)
ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
```

#### 3. Foreign Key Violations

**Problem:** "violates foreign key constraint"

**Solution:**

```sql
-- Check foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

#### 4. Slow Queries

**Problem:** Database queries are slow

**Solution:**

```sql
-- Enable query timing
SET statement_timeout = 10000; -- 10 seconds

-- Analyze slow query
EXPLAIN ANALYZE
SELECT * FROM executions WHERE user_id = 'user-uuid';

-- Check missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
ORDER BY abs(correlation) DESC;
```

#### 5. Storage Issues

**Problem:** Cannot upload files

**Solution:**

```sql
-- Check storage policies
SELECT * FROM storage.objects WHERE bucket_id = 'uploads' LIMIT 5;

-- Check bucket configuration
SELECT * FROM storage.buckets;

-- Verify storage RLS
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Diagnostic Queries

#### Check Database Size

```sql
SELECT 
  pg_size_pretty(pg_database_size('postgres')) as total_size,
  (SELECT pg_size_pretty(SUM(pg_total_relation_size(quote_ident(tablename)::regclass))::bigint)
   FROM pg_tables WHERE schemaname = 'public') as public_schema_size;
```

#### Check Table Sizes

```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(quote_ident(tablename)::regclass)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(quote_ident(tablename)::regclass) DESC;
```

#### Check Active Connections

```sql
SELECT 
  datname,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname;
```

#### Check Long-Running Queries

```sql
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
AND now() - pg_stat_activity.query_start > interval '5 minutes'
ORDER BY duration DESC;
```

---


## Performance Optimization

### Query Optimization Tips

1. **Use indexes** for frequently queried columns
2. **Limit results** with pagination
3. **Select only needed columns** (avoid `SELECT *`)
4. **Use prepared statements** to prevent SQL injection
5. **Batch inserts** when possible
6. **Cache frequently accessed data** (e.g., tool definitions)

### Pagination Example

```sql
-- Efficient pagination using keyset pagination
SELECT * FROM executions
WHERE user_id = $1
AND created_at < $2  -- Last seen timestamp
ORDER BY created_at DESC
LIMIT 20;
```

### Connection Pooling

Use connection pooling in production:

```typescript
// lib/supabase/pool.ts
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

### Database Maintenance

```sql
-- Vacuum tables regularly
VACUUM ANALYZE public.executions;

-- Update statistics
ANALYZE public.executions;

-- Reindex if needed
REINDEX TABLE public.executions;
```

---

## Monitoring

### Key Metrics to Monitor

1. **Connection count** - Should stay below max connections
2. **Query performance** - Slow query log
3. **Table sizes** - Monitor growth
4. **Index usage** - Remove unused indexes
5. **Cache hit ratio** - Should be > 95%
6. **Replication lag** - For read replicas

### Monitoring Queries

```sql
-- Cache hit ratio
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- Table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_tup_ins - n_tup_del AS net_inserts,
  n_tup_upd AS updates,
  n_tup_del AS deletes
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Storage policies configured
- [ ] Service role key secured
- [ ] API keys hashed (SHA-256)
- [ ] Regular security audits
- [ ] Backup strategy in place
- [ ] Connection strings not exposed
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)

---

## Additional Resources

### Supabase Documentation

- **Database**: https://supabase.com/docs/guides/database
- **Storage**: https://supabase.com/docs/guides/storage
- **Auth**: https://supabase.com/docs/guides/auth
- **RLS**: https://supabase.com/docs/guides/auth/row-level-security

### PostgreSQL Documentation

- **Official Docs**: https://www.postgresql.org/docs/
- **Performance Tips**: https://wiki.postgresql.org/wiki/Performance_Optimization

### Tools

- **pgAdmin**: GUI tool for PostgreSQL
- **DBeaver**: Universal database tool
- **Supabase CLI**: Command-line tool for Supabase

---

## Support

For database-related issues:

1. Check this documentation
2. Review Supabase logs in dashboard
3. Check GitHub issues
4. Contact Supabase support

---

**End of Database Documentation**

*Last updated: July 2, 2026*
