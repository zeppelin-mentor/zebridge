# ZeBridge Backend Implementation Guide

**Version:** 1.0  
**Last Updated:** July 2, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
6. [Phase 2: Authentication & Database](#phase-2-authentication--database)
7. [Phase 3: REST API Implementation](#phase-3-rest-api-implementation)
8. [Phase 4: MCP Server Implementation](#phase-4-mcp-server-implementation)
9. [Phase 5: Tool Implementation](#phase-5-tool-implementation)
10. [Phase 6: Queue System](#phase-6-queue-system)
11. [Phase 7: Storage & File Management](#phase-7-storage--file-management)
12. [Security & Best Practices](#security--best-practices)
13. [Testing Strategy](#testing-strategy)
14. [Deployment](#deployment)

---

## Overview

This document provides a comprehensive implementation guide for building the ZeBridge backend. ZeBridge exposes production-ready tools to AI agents through three interfaces:

- **MCP Server** (`/mcp`) - Model Context Protocol endpoint for AI agents
- **REST API** (`/v1/*`) - Standard HTTP API endpoints
- **Web Dashboard** - User interface for managing tools and executions

The backend is built using Next.js 16.2.9 with TypeScript, leveraging:
- Next.js Route Handlers for API endpoints
- Supabase for database, authentication, and storage
- BullMQ + Redis for background job processing
- MCP SDK for AI agent integration

---

## Architecture


```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Clients                                │
│  (Claude Code, Cursor, Windsurf, Gemini CLI, Custom Agents)    │
└────────────────┬───────────────────┬────────────────────────────┘
                 │                   │
                 ▼                   ▼
         ┌──────────────┐    ┌──────────────┐
         │  MCP Server  │    │   REST API   │
         │    /mcp      │    │    /v1/*     │
         └──────┬───────┘    └──────┬───────┘
                │                   │
                └─────────┬─────────┘
                          ▼
                ┌──────────────────┐
                │ Tool Dispatcher   │
                │  (Route Handler)  │
                └─────────┬────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │  PDF   │      │ Image  │      │   AI   │
    │ Tools  │      │ Tools  │      │ Tools  │
    └───┬────┘      └───┬────┘      └───┬────┘
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                ┌──────────────┐
                │   Supabase   │
                │  (Database   │
                │  + Storage)  │
                └──────────────┘

    Note: BullMQ/Redis queue system will be added in v2.0 for 
    background job processing and scalability.
```


---

## Technology Stack

### Core Framework
- **Next.js 16.2.9** - React framework with App Router
- **TypeScript 5.x** - Type-safe development
- **Node.js 20+** - Runtime environment

### Backend Services
- **Supabase** - PostgreSQL database, authentication, and storage

### MCP Integration
- **@modelcontextprotocol/sdk** - Official MCP SDK for server implementation
- **Zod** - Schema validation for tool inputs/outputs

### Additional Libraries
- **@supabase/supabase-js** - Supabase client library
- **@supabase/ssr** - Server-side rendering support for Supabase

### Future Versions (v2.0)
- **BullMQ** - Redis-based job queue for background processing
- **Redis** - In-memory data store for queue management
- **ioredis** - Redis client for BullMQ

---

## Project Structure

> **Important**: In Next.js App Router, you can create API endpoints anywhere in the `app/` directory without the `/api` prefix. Simply create a `route.ts` file in any folder, and it becomes an API endpoint at that path.
>
> **Example**: `app/mcp/route.ts` → Endpoint at `/mcp`  
> **Example**: `app/v1/tools/pdf-merge/route.ts` → Endpoint at `/v1/tools/pdf-merge`

```
zebridge/
├── app/
│   ├── mcp/
│   │   └── route.ts                  # MCP server endpoint at /mcp
│   ├── v1/
│   │   ├── tools/
│   │   │   ├── remove-background/
│   │   │   │   └── route.ts          # Tool endpoint at /v1/tools/remove-background
│   │   │   ├── pdf-to-word/
│   │   │   │   └── route.ts          # Tool endpoint at /v1/tools/pdf-to-word
│   │   │   ├── merge-pdf/
│   │   │   │   └── route.ts
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── route.ts          # Auth endpoint at /v1/auth/signin
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   └── executions/
│   │       └── route.ts              # Executions at /v1/executions
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard UI at /dashboard
│   ├── page.tsx                      # Landing page at /
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts             # Auth middleware
│   ├── mcp/
│   │   ├── server.ts                 # MCP server setup
│   │   ├── tools/
│   │   │   ├── registry.ts           # Tool registration
│   │   │   ├── pdf-tools.ts          # PDF tool handlers
│   │   │   ├── image-tools.ts        # Image tool handlers
│   │   │   └── ai-tools.ts           # AI tool handlers
│   │   └── types.ts                  # MCP type definitions
│   ├── tools/
│   │   ├── pdf-tools.ts              # PDF processing functions
│   │   ├── image-tools.ts            # Image processing functions
│   │   └── ai-tools.ts               # AI tool functions
│   ├── storage/
│   │   ├── upload.ts                 # File upload handlers
│   │   └── cleanup.ts                # Temp file cleanup
│   ├── auth/
│   │   ├── api-key.ts                # API key validation
│   │   └── rate-limit.ts             # Rate limiting
│   └── utils/
│       ├── validation.ts             # Input validation
│       └── errors.ts                 # Error handling
├── types/
│   ├── database.types.ts             # Supabase generated types
│   └── api.types.ts                  # API type definitions
└── middleware.ts                     # Next.js middleware

Note: BullMQ workers and Redis queue will be added in v2.0
```

---


## Phase 1: Foundation Setup

### 1.1 Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @modelcontextprotocol/sdk
npm install zod

# Tool processing libraries
npm install pdf-lib sharp qrcode

# Additional utilities
npm install jose                    # JWT handling

# Development dependencies
npm install --save-dev @types/node
npm install --save-dev @types/qrcode
```

**Note:** BullMQ, Redis, and ioredis will be added in v2.0 for background job processing.
npm install --save-dev tsx          # TypeScript executor for workers
```

### 1.2 Environment Variables

Create `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_KEY_SECRET=your_secret_key_for_hashing

# Tool Configuration
MAX_FILE_SIZE=104857600              # 100MB in bytes
ALLOWED_FILE_TYPES=pdf,docx,png,jpg,jpeg
TEMP_FILE_TTL=3600                   # 1 hour in seconds

# Rate Limiting
RATE_LIMIT_FREE_TIER=25              # Requests per day
RATE_LIMIT_PRO_TIER=unlimited

# Note: Redis configuration will be added in v2.0
```

### 1.3 TypeScript Configuration

Update `tsconfig.json` to include path aliases:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---


## Phase 2: Authentication & Database

### 2.1 Supabase Setup

#### Create Supabase Client (Browser)

**File:** `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Create Supabase Client (Server)

**File:** `lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component limitation - can be ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component limitation - can be ignored
          }
        },
      },
    }
  )
}

// Service role client for admin operations
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {},
    }
  )
}
```


#### Next.js Middleware for Session Management

**File:** `middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2.2 Database Schema

Create the following tables in Supabase:

#### Users Table (Extended)

```sql
-- Extends Supabase auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
```


#### API Keys Table

```sql
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);
```

#### Tools Table

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tools_slug ON public.tools(slug);
CREATE INDEX idx_tools_category ON public.tools(category);

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Public read access for tools
CREATE POLICY "Anyone can read enabled tools" ON public.tools
  FOR SELECT USING (enabled = true);
```

#### Executions Table

```sql
CREATE TABLE public.executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES public.tools(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input JSONB NOT NULL,
  output JSONB,
  error TEXT,
  duration INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_executions_user_id ON public.executions(user_id);
CREATE INDEX idx_executions_tool_id ON public.executions(tool_id);
CREATE INDEX idx_executions_status ON public.executions(status);
CREATE INDEX idx_executions_created_at ON public.executions(created_at DESC);

ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own executions" ON public.executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own executions" ON public.executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```


#### Files Table

```sql
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.executions(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('input', 'output')),
  path TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_execution_id ON public.files(execution_id);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read files from own executions" ON public.files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.executions 
      WHERE executions.id = files.execution_id 
      AND executions.user_id = auth.uid()
    )
  );
```

#### Usage Table

```sql
CREATE TABLE public.usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  requests INTEGER DEFAULT 0,
  storage_bytes BIGINT DEFAULT 0,
  bandwidth_bytes BIGINT DEFAULT 0,
  UNIQUE(user_id, month)
);

CREATE INDEX idx_usage_user_month ON public.usage(user_id, month);

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage" ON public.usage
  FOR SELECT USING (auth.uid() = user_id);
```

### 2.3 Storage Buckets

Create storage buckets in Supabase:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('uploads', 'uploads', false),
  ('outputs', 'outputs', false),
  ('temp', 'temp', false);

-- Storage policies for uploads bucket
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Similar policies for outputs and temp buckets
-- (Repeat with bucket_id = 'outputs' and bucket_id = 'temp')
```

---


## Phase 3: REST API Implementation

### 3.1 API Authentication Middleware

**File:** `lib/auth/api-key.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export interface AuthContext {
  userId: string
  apiKeyId: string
  plan: string
}

export async function validateApiKey(
  request: NextRequest
): Promise<AuthContext | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const apiKey = authHeader.substring(7)
  
  // Hash the API key
  const crypto = require('crypto')
  const keyHash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')

  const supabase = createServiceClient()
  
  // Look up API key
  const { data: apiKeyData, error } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', keyHash)
    .single()

  if (error || !apiKeyData) {
    return null
  }

  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKeyData.id)

  // Get user plan
  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', apiKeyData.user_id)
    .single()

  return {
    userId: apiKeyData.user_id,
    apiKeyId: apiKeyData.id,
    plan: userData?.plan || 'free',
  }
}
```


### 3.2 Rate Limiting

**File:** `lib/auth/rate-limit.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/server'

export async function checkRateLimit(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createServiceClient()
  
  // Get current month
  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get or create usage record
  const { data: usage } = await supabase
    .from('usage')
    .select('requests')
    .eq('user_id', userId)
    .eq('month', month.toISOString().split('T')[0])
    .single()

  const currentRequests = usage?.requests || 0

  // Check plan limits
  const limits = {
    free: 25,
    pro: Infinity,
    team: Infinity,
    enterprise: Infinity,
  }

  const limit = limits[plan as keyof typeof limits] || limits.free
  const allowed = currentRequests < limit
  const remaining = Math.max(0, limit - currentRequests)

  return { allowed, remaining }
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = createServiceClient()
  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  // Upsert usage record
  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_month: month,
  })
}

// Create this SQL function in Supabase:
/*
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_month DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage (user_id, month, requests)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET requests = usage.requests + 1;
END;
$$ LANGUAGE plpgsql;
*/
```


### 3.3 Example REST API Route Handler

**File:** `app/v1/tools/remove-background/route.ts`

> **Note**: This creates the endpoint at `/v1/tools/remove-background` (no `/api` prefix)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { checkRateLimit, incrementUsage } from '@/lib/auth/rate-limit'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { removeBackground } from '@/lib/tools/image-tools'

// Input validation schema
const RemoveBackgroundSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  outputFormat: z.enum(['png', 'webp']).default('png'),
}).refine(
  (data) => data.imageUrl || data.imageBase64,
  { message: 'Either imageUrl or imageBase64 must be provided' }
)

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // 2. Check rate limit
    const { allowed, remaining } = await checkRateLimit(
      authContext.userId,
      authContext.plan
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', remaining: 0 },
        { status: 429 }
      )
    }

    // 3. Parse and validate input
    const body = await request.json()
    const validatedInput = RemoveBackgroundSchema.parse(body)

    // 4. Create execution record
    const supabase = createServiceClient()
    
    const { data: tool } = await supabase
      .from('tools')
      .select('id')
      .eq('slug', 'remove-background')
      .single()

    const { data: execution, error: execError } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        tool_id: tool!.id,
        status: 'processing',
        input: validatedInput,
      })
      .select()
      .single()

    if (execError) {
      throw execError
    }

    // 5. Process the tool directly (synchronously)
    const startTime = Date.now()
    
    try {
      const result = await removeBackground(
        validatedInput,
        authContext.userId,
        execution.id
      )

      // Update execution with result
      await supabase
        .from('executions')
        .update({
          status: 'completed',
          output: result,
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      // Increment usage
      await incrementUsage(authContext.userId)

      // Return successful response
      return NextResponse.json({
        executionId: execution.id,
        status: 'completed',
        output: result,
        duration: Date.now() - startTime,
      }, {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      })

    } catch (toolError) {
      // Update execution with error
      await supabase
        .from('executions')
        .update({
          status: 'failed',
          error: toolError instanceof Error ? toolError.message : 'Unknown error',
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      throw toolError
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in remove-background API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Note:** In v2.0, tool processing will be moved to background workers using BullMQ for better scalability and async processing.

---


## Phase 4: MCP Server Implementation

### 4.1 MCP Server Setup

**File:** `lib/mcp/server.ts`

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'

export function createMCPServer() {
  const server = new McpServer({
    name: 'ZeBridge MCP Server',
    version: '1.0.0',
  })

  return server
}

export { StreamableHTTPServerTransport }
```

### 4.2 Tool Registry

**File:** `lib/mcp/tools/registry.ts`

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: z.ZodType<any>
  handler: (input: any, context: ToolContext) => Promise<ToolResult>
}

export interface ToolContext {
  userId: string
  executionId: string
}

export interface ToolResult {
  content: Array<{ type: 'text' | 'image'; text?: string; data?: string; mimeType?: string }>
}

export function registerTools(server: McpServer, tools: ToolDefinition[]) {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (input) => {
        return await tool.handler(input, {
          userId: 'system', // Will be populated from auth context
          executionId: 'pending',
        })
      }
    )
  }
}
```


### 4.3 MCP Tool Definitions

**File:** `lib/mcp/tools/pdf-tools.ts`

```typescript
import { z } from 'zod'
import { ToolDefinition } from './registry'
import { mergePdf, splitPdf, pdfToWord } from '@/lib/tools/pdf-tools'

export const pdfTools: ToolDefinition[] = [
  {
    name: 'pdf_merge',
    description: 'Merge multiple PDF files into a single PDF',
    inputSchema: z.object({
      pdfUrls: z.array(z.string().url()).min(2).max(10).describe('Array of PDF URLs to merge'),
      outputFilename: z.string().optional().describe('Optional output filename'),
    }),
    handler: async (input, context) => {
      const result = await mergePdf(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `PDF merge completed. Output: ${result.outputUrl}`,
        }],
      }
    },
  },
  {
    name: 'pdf_split',
    description: 'Split a PDF into individual pages or ranges',
    inputSchema: z.object({
      pdfUrl: z.string().url().describe('URL of the PDF to split'),
      ranges: z.array(z.object({
        start: z.number().int().positive(),
        end: z.number().int().positive(),
      })).optional().describe('Page ranges to extract (optional, defaults to individual pages)'),
    }),
    handler: async (input, context) => {
      const result = await splitPdf(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `PDF split completed. ${result.files.length} files created.`,
        }],
      }
    },
  },
  {
    name: 'pdf_to_word',
    description: 'Convert PDF to Word (DOCX) format',
    inputSchema: z.object({
      pdfUrl: z.string().url().describe('URL of the PDF to convert'),
      preserveFormatting: z.boolean().default(true).describe('Preserve original formatting'),
    }),
    handler: async (input, context) => {
      const result = await pdfToWord(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `PDF to Word conversion completed. Output: ${result.outputUrl}`,
        }],
      }
    },
  },
]
```

**Note:** In v2.0, long-running operations will be moved to background workers using BullMQ.


**File:** `lib/mcp/tools/image-tools.ts`

```typescript
import { z } from 'zod'
import { ToolDefinition } from './registry'
import { removeBackground, upscaleImage } from '@/lib/tools/image-tools'

export const imageTools: ToolDefinition[] = [
  {
    name: 'remove_background',
    description: 'Remove background from an image',
    inputSchema: z.object({
      imageUrl: z.string().url().optional().describe('URL of the image'),
      imageBase64: z.string().optional().describe('Base64 encoded image'),
      outputFormat: z.enum(['png', 'webp']).default('png').describe('Output format'),
    }).refine(
      (data) => data.imageUrl || data.imageBase64,
      { message: 'Either imageUrl or imageBase64 must be provided' }
    ),
    handler: async (input, context) => {
      const result = await removeBackground(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `Background removal completed. Output: ${result.outputUrl}`,
        }],
      }
    },
  },
  {
    name: 'image_upscale',
    description: 'Upscale image resolution using AI',
    inputSchema: z.object({
      imageUrl: z.string().url().describe('URL of the image to upscale'),
      scaleFactor: z.enum(['2x', '4x']).default('2x').describe('Upscale factor'),
    }),
    handler: async (input, context) => {
      const result = await upscaleImage(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `Image upscale completed. Output: ${result.outputUrl}`,
        }],
      }
    },
  },
]
```


### 4.4 MCP Route Handler

**File:** `app/mcp/route.ts`

> **Note**: This creates the endpoint at `/mcp` (no `/api` prefix)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createMCPServer, StreamableHTTPServerTransport } from '@/lib/mcp/server'
import { registerTools } from '@/lib/mcp/tools/registry'
import { pdfTools } from '@/lib/mcp/tools/pdf-tools'
import { imageTools } from '@/lib/mcp/tools/image-tools'
import { validateApiKey } from '@/lib/auth/api-key'
import { checkRateLimit } from '@/lib/auth/rate-limit'

// Create MCP server instance
const mcpServer = createMCPServer()

// Register all tools
registerTools(mcpServer, [...pdfTools, ...imageTools])

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Check rate limit
    const { allowed } = await checkRateLimit(
      authContext.userId,
      authContext.plan
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Create transport for this request
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })

    // Handle the MCP request
    const body = await request.json()
    const response = new NextResponse()
    
    response.headers.set('Content-Type', 'application/json')
    
    // Close transport when response closes
    response.body?.addEventListener('close', () => {
      transport.close()
    })

    // Connect server to transport
    await mcpServer.connect(transport)
    
    // Process the request
    await transport.handleRequest(request, response, body)

    return response

  } catch (error) {
    console.error('MCP server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Enable CORS for MCP clients
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

---


## Phase 5: Tool Implementation

### 5.1 Tool Implementation Strategy

Each tool should:
1. Accept validated input from the queue
2. Process the task (PDF conversion, image manipulation, etc.)
3. Store results in Supabase Storage
4. Update execution status in database
5. Return output URLs

### 5.2 Example Tool Implementation

For Phase 1 MVP, you'll need to implement these tools:
- **PDF Tools**: merge, split, compress, pdf-to-word, word-to-pdf
- **Image Tools**: background removal, upscale, compress
- **OCR Tools**: text extraction from images/PDFs
- **Generator Tools**: invoice generation, QR codes

### 5.3 Third-Party Services

You'll likely need to integrate with external services:

**PDF Processing:**
- [pdf-lib](https://pdf-lib.js.org/) - Pure JavaScript PDF manipulation
- [pdf2json](https://www.npmjs.com/package/pdf2json) - PDF parsing
- Or commercial APIs like [PDFCo](https://pdf.co/), [DocParser](https://docparser.com/)

**Image Processing:**
- [remove.bg API](https://www.remove.bg/api) - Background removal
- [Sharp](https://sharp.pixelplumbing.com/) - High-performance image processing
- [Cloudinary](https://cloudinary.com/) - Image transformation service

**OCR:**
- [Tesseract.js](https://tesseract.projectnaptha.com/) - Open-source OCR
- [Google Cloud Vision API](https://cloud.google.com/vision)
- [AWS Textract](https://aws.amazon.com/textract/)

**Document Generation:**
- [PDFKit](https://pdfkit.org/) - PDF generation
- [Puppeteer](https://pptr.dev/) - HTML to PDF
- [jsPDF](https://github.com/parallax/jsPDF) - Client-side PDF generation

Install required packages:

```bash
npm install pdf-lib sharp qrcode
npm install @types/qrcode --save-dev
```

---


## Phase 6: Queue System

### 6.1 Redis Connection

**File:** `lib/queue/connection.ts`

```typescript
import { Redis } from 'ioredis'

let redisConnection: Redis | null = null

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })

    redisConnection.on('error', (error) => {
      console.error('Redis connection error:', error)
    })

    redisConnection.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }

  return redisConnection
}
```

### 6.2 Queue Definitions

**File:** `lib/queue/queues.ts`

```typescript
import { Queue } from 'bullmq'
import { getRedisConnection } from './connection'

const connection = getRedisConnection()

// Define queues
export const pdfQueue = new Queue('pdf-processing', { connection })
export const imageQueue = new Queue('image-processing', { connection })
export const aiQueue = new Queue('ai-processing', { connection })

// Helper to add jobs
export async function addJob(
  queueName: string,
  data: any,
  options?: any
) {
  const queueMap: Record<string, Queue> = {
    'pdf-processing': pdfQueue,
    'image-processing': imageQueue,
    'ai-processing': aiQueue,
  }

  const queue = queueMap[queueName]
  if (!queue) {
    throw new Error(`Unknown queue: ${queueName}`)
  }

  return await queue.add(data.tool, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    ...options,
  })
}
```


### 6.3 Worker Implementation

**File:** `lib/queue/workers/pdf-worker.ts`

```typescript
import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { createServiceClient } from '@/lib/supabase/server'
import { PDFDocument } from 'pdf-lib'
import fetch from 'node-fetch'

const connection = getRedisConnection()

export const pdfWorker = new Worker(
  'pdf-processing',
  async (job: Job) => {
    const { executionId, userId, tool, input } = job.data
    const startTime = Date.now()

    try {
      console.log(`Processing job ${job.id}: ${tool}`)
      
      let result: any

      switch (tool) {
        case 'pdf_merge':
          result = await handlePdfMerge(input, userId, executionId)
          break
        case 'pdf_split':
          result = await handlePdfSplit(input, userId, executionId)
          break
        case 'pdf_to_word':
          result = await handlePdfToWord(input, userId, executionId)
          break
        default:
          throw new Error(`Unknown tool: ${tool}`)
      }

      // Update execution status
      const supabase = createServiceClient()
      await supabase
        .from('executions')
        .update({
          status: 'completed',
          output: result,
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId)

      return result

    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error)
      
      // Update execution with error
      const supabase = createServiceClient()
      await supabase
        .from('executions')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId)

      throw error
    }
  },
  { connection, concurrency: 5 }
)

async function handlePdfMerge(input: any, userId: string, executionId: string) {
  const { pdfUrls, outputFilename } = input
  
  // Create new PDF document
  const mergedPdf = await PDFDocument.create()

  // Download and merge PDFs
  for (const url of pdfUrls) {
    const response = await fetch(url)
    const pdfBytes = await response.arrayBuffer()
    const pdf = await PDFDocument.load(pdfBytes)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  // Save merged PDF
  const mergedPdfBytes = await mergedPdf.save()
  
  // Upload to Supabase Storage
  const supabase = createServiceClient()
  const filename = outputFilename || `merged-${Date.now()}.pdf`
  const path = `${userId}/${executionId}/${filename}`

  await supabase.storage
    .from('outputs')
    .upload(path, mergedPdfBytes, {
      contentType: 'application/pdf',
    })

  const { data: { publicUrl } } = supabase.storage
    .from('outputs')
    .getPublicUrl(path)

  return {
    outputUrl: publicUrl,
    filename,
    pageCount: mergedPdf.getPageCount(),
  }
}

async function handlePdfSplit(input: any, userId: string, executionId: string) {
  // Implementation for PDF splitting
  throw new Error('Not implemented yet')
}

async function handlePdfToWord(input: any, userId: string, executionId: string) {
  // Implementation for PDF to Word conversion
  throw new Error('Not implemented yet')
}

pdfWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

pdfWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})
```


**File:** `lib/queue/workers/image-worker.ts`

```typescript
import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { createServiceClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import fetch from 'node-fetch'

const connection = getRedisConnection()

export const imageWorker = new Worker(
  'image-processing',
  async (job: Job) => {
    const { executionId, userId, tool, input } = job.data
    const startTime = Date.now()

    try {
      console.log(`Processing job ${job.id}: ${tool}`)
      
      let result: any

      switch (tool) {
        case 'remove_background':
          result = await handleRemoveBackground(input, userId, executionId)
          break
        case 'image_upscale':
          result = await handleImageUpscale(input, userId, executionId)
          break
        default:
          throw new Error(`Unknown tool: ${tool}`)
      }

      const supabase = createServiceClient()
      await supabase
        .from('executions')
        .update({
          status: 'completed',
          output: result,
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId)

      return result

    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error)
      
      const supabase = createServiceClient()
      await supabase
        .from('executions')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId)

      throw error
    }
  },
  { connection, concurrency: 3 }
)

async function handleRemoveBackground(input: any, userId: string, executionId: string) {
  // This is a placeholder - you'll need to integrate with remove.bg API
  // or implement your own background removal logic
  throw new Error('Background removal not implemented yet - integrate with remove.bg API')
}

async function handleImageUpscale(input: any, userId: string, executionId: string) {
  const { imageUrl, scaleFactor } = input
  
  // Download image
  const response = await fetch(imageUrl)
  const imageBuffer = Buffer.from(await response.arrayBuffer())

  // Upscale using sharp
  const multiplier = scaleFactor === '4x' ? 4 : 2
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  
  const upscaled = await image
    .resize(
      Math.round((metadata.width || 0) * multiplier),
      Math.round((metadata.height || 0) * multiplier),
      { kernel: 'lanczos3' }
    )
    .toBuffer()

  // Upload to Supabase Storage
  const supabase = createServiceClient()
  const filename = `upscaled-${scaleFactor}-${Date.now()}.png`
  const path = `${userId}/${executionId}/${filename}`

  await supabase.storage
    .from('outputs')
    .upload(path, upscaled, {
      contentType: 'image/png',
    })

  const { data: { publicUrl } } = supabase.storage
    .from('outputs')
    .getPublicUrl(path)

  return {
    outputUrl: publicUrl,
    filename,
    originalSize: { width: metadata.width, height: metadata.height },
    newSize: { 
      width: Math.round((metadata.width || 0) * multiplier), 
      height: Math.round((metadata.height || 0) * multiplier) 
    },
  }
}
```


### 6.4 Worker Startup Script

**File:** `workers/start-workers.ts`

```typescript
import { pdfWorker } from '../lib/queue/workers/pdf-worker'
import { imageWorker } from '../lib/queue/workers/image-worker'

console.log('Starting BullMQ workers...')

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing workers...')
  await pdfWorker.close()
  await imageWorker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing workers...')
  await pdfWorker.close()
  await imageWorker.close()
  process.exit(0)
})

console.log('Workers are running and ready to process jobs')
```

Add script to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "workers": "tsx workers/start-workers.ts"
  }
}
```

---


## Phase 7: Storage & File Management

### 7.1 File Upload Handler

**File:** `lib/storage/upload.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/server'

export interface UploadResult {
  path: string
  publicUrl: string
  size: number
  mimeType: string
}

export async function uploadFile(
  userId: string,
  executionId: string,
  file: Buffer,
  filename: string,
  mimeType: string,
  bucket: 'uploads' | 'outputs' | 'temp' = 'uploads'
): Promise<UploadResult> {
  const supabase = createServiceClient()
  
  const path = `${userId}/${executionId}/${filename}`
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return {
    path,
    publicUrl,
    size: file.length,
    mimeType,
  }
}

export async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}
```

### 7.2 Cleanup Service

**File:** `lib/storage/cleanup.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/server'

export async function cleanupTempFiles() {
  const supabase = createServiceClient()
  const ttl = parseInt(process.env.TEMP_FILE_TTL || '3600')
  const cutoffDate = new Date(Date.now() - ttl * 1000)

  // List old files in temp bucket
  const { data: files, error } = await supabase.storage
    .from('temp')
    .list('', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'asc' },
    })

  if (error || !files) {
    console.error('Error listing temp files:', error)
    return
  }

  // Delete files older than TTL
  const filesToDelete = files
    .filter((file) => new Date(file.created_at) < cutoffDate)
    .map((file) => file.name)

  if (filesToDelete.length > 0) {
    const { error: deleteError } = await supabase.storage
      .from('temp')
      .remove(filesToDelete)

    if (deleteError) {
      console.error('Error deleting temp files:', deleteError)
    } else {
      console.log(`Deleted ${filesToDelete.length} temp files`)
    }
  }
}

// Run cleanup every hour
setInterval(() => {
  cleanupTempFiles().catch(console.error)
}, 3600000)
```

---


## Security & Best Practices

### API Key Generation

**File:** `lib/auth/generate-api-key.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function generateApiKey(
  userId: string,
  name: string
): Promise<{ apiKey: string; keyId: string }> {
  // Generate random API key
  const apiKey = `zbr_${crypto.randomBytes(32).toString('hex')}`
  
  // Hash the key for storage
  const keyHash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')

  // Store in database
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name,
      key_hash: keyHash,
      prefix: apiKey.substring(0, 10),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`)
  }

  return {
    apiKey, // Return only once - cannot be retrieved later
    keyId: data.id,
  }
}
```

### Input Validation

Always use Zod schemas for input validation:

```typescript
import { z } from 'zod'

export const FileUploadSchema = z.object({
  file: z.instanceof(Buffer),
  filename: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+]+$/),
  size: z.number().positive().max(104857600), // 100MB max
})
```

### Error Handling

**File:** `lib/utils/errors.ts`

```typescript
export class ZeBridgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ZeBridgeError'
  }
}

export class AuthenticationError extends ZeBridgeError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401)
  }
}

export class RateLimitError extends ZeBridgeError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429)
  }
}

export class ValidationError extends ZeBridgeError {
  constructor(message: string, public details?: any) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ZeBridgeError) {
    return {
      error: error.message,
      code: error.code,
      details: error instanceof ValidationError ? error.details : undefined,
    }
  }

  console.error('Unexpected error:', error)
  return {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  }
}
```

---


## Testing Strategy

### Unit Tests

Install testing dependencies:

```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Add test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

Example test:

**File:** `lib/auth/__tests__/api-key.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { generateApiKey } from '../generate-api-key'

describe('API Key Generation', () => {
  it('should generate valid API key with zbr_ prefix', async () => {
    const { apiKey } = await generateApiKey('test-user-id', 'Test Key')
    expect(apiKey).toMatch(/^zbr_[a-f0-9]{64}$/)
  })
})
```

### Integration Tests

Test API endpoints:

```typescript
import { describe, it, expect } from 'vitest'

describe('POST /v1/tools/remove-background', () => {
  it('should return 401 without API key', async () => {
    const response = await fetch('http://localhost:3000/v1/tools/remove-background', {
      method: 'POST',
      body: JSON.stringify({ imageUrl: 'https://example.com/image.png' }),
    })
    expect(response.status).toBe(401)
  })
})
```

---


## Deployment

### Environment Setup

#### Production Environment Variables

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Redis (Production) - Use managed Redis service
REDIS_URL=redis://your-redis-instance:6379
REDIS_PASSWORD=your_redis_password

# Application
NEXT_PUBLIC_APP_URL=https://zebridge.com
NODE_ENV=production

# Tool Configuration
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,docx,png,jpg,jpeg
TEMP_FILE_TTL=3600

# External Services (if using)
REMOVE_BG_API_KEY=your_removebg_key
```

### Deployment Options

#### Option 1: Vercel (Recommended for Next.js)

1. **Deploy Frontend + API Routes:**
   ```bash
   vercel deploy --prod
   ```

2. **Deploy Workers Separately:**
   - Workers need to run as a separate process
   - Deploy to a service like Railway, Render, or AWS EC2
   - Use process manager like PM2

**File:** `ecosystem.config.js` (for PM2)

```javascript
module.exports = {
  apps: [{
    name: 'zebridge-workers',
    script: 'tsx',
    args: 'workers/start-workers.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

#### Option 2: Docker Deployment

**File:** `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - redis

  workers:
    build: .
    command: npm run workers
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Monitoring

Implement health check endpoints:

**File:** `app/health/route.ts`

> **Note**: This creates the endpoint at `/health` (no `/api` prefix)

```typescript
import { NextResponse } from 'next/server'
import { getRedisConnection } from '@/lib/queue/connection'

export async function GET() {
  try {
    // Check Redis connection
    const redis = getRedisConnection()
    await redis.ping()

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: 'connected',
        database: 'connected', // Add Supabase health check
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
```

---


## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Install all dependencies
- [ ] Set up environment variables
- [ ] Configure TypeScript and path aliases
- [ ] Set up Supabase project
- [ ] Create database schema (all tables)
- [ ] Create storage buckets with policies
- [ ] Set up Redis connection
- [ ] Test database and storage connectivity

### Phase 2: Authentication (Week 1-2)
- [ ] Implement Supabase client utilities
- [ ] Create Next.js middleware for session management
- [ ] Implement API key generation
- [ ] Implement API key validation
- [ ] Implement rate limiting
- [ ] Test authentication flow

### Phase 3: REST API (Week 2)
- [ ] Create REST API route structure
- [ ] Implement authentication middleware
- [ ] Create example tool endpoint (remove-background)
- [ ] Test API with Postman/Insomnia
- [ ] Implement CORS headers
- [ ] Add request validation with Zod

### Phase 4: MCP Server (Week 2-3)
- [ ] Install MCP SDK
- [ ] Create MCP server setup
- [ ] Implement tool registry
- [ ] Define PDF tools
- [ ] Define Image tools
- [ ] Create MCP route handler
- [ ] Test MCP endpoint with Claude Desktop or MCP client

### Phase 5: Queue System (Week 3)
- [ ] Set up BullMQ queues
- [ ] Implement PDF worker
- [ ] Implement Image worker
- [ ] Create worker startup script
- [ ] Test job processing end-to-end
- [ ] Add worker monitoring

### Phase 6: Tool Implementation (Week 3-4)
- [ ] Implement PDF merge tool
- [ ] Implement PDF split tool
- [ ] Implement PDF-to-Word tool
- [ ] Implement background removal (integrate API)
- [ ] Implement image upscale
- [ ] Implement OCR tool
- [ ] Test all tools

### Phase 7: Storage & Cleanup (Week 4)
- [ ] Implement file upload handlers
- [ ] Implement file download handlers
- [ ] Create cleanup service for temp files
- [ ] Test storage with large files
- [ ] Monitor storage usage

### Phase 8: Testing & Documentation (Week 4)
- [ ] Write unit tests for core functions
- [ ] Write integration tests for API endpoints
- [ ] Create API documentation
- [ ] Create MCP configuration guide
- [ ] Test with real AI clients (Claude, Cursor)

### Phase 9: Deployment (Week 4)
- [ ] Set up production environment
- [ ] Deploy to Vercel/hosting platform
- [ ] Deploy workers
- [ ] Set up Redis in production
- [ ] Configure monitoring
- [ ] Test production deployment

---

## Additional Resources

### Documentation Links

- **Next.js App Router:** https://nextjs.org/docs/app
- **Supabase JavaScript Client:** https://supabase.com/docs/reference/javascript
- **Model Context Protocol:** https://modelcontextprotocol.io
- **BullMQ:** https://docs.bullmq.io
- **Zod:** https://zod.dev

### Example MCP Configuration for Claude Desktop

Users can connect to your MCP server by adding this to their Claude Desktop config:

```json
{
  "mcpServers": {
    "zebridge": {
      "url": "https://zebridge.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

### Sample API Request

```bash
curl -X POST https://zebridge.com/v1/tools/remove-background \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.png",
    "outputFormat": "png"
  }'
```

---

## Next Steps

After completing Phase 1 (MVP), consider these enhancements:

1. **Dashboard UI** - Build React components for:
   - API key management
   - Execution history
   - Usage analytics
   - Tool testing interface

2. **Webhooks** - Allow users to receive notifications when jobs complete

3. **Batch Processing** - Process multiple files in one request

4. **Custom Tools** - Allow users to upload their own tool implementations

5. **Marketplace** - Let developers publish and monetize tools

6. **CLI Tool** - Create command-line interface for ZeBridge

7. **SDKs** - Build client libraries for Python, JavaScript, Go

---

**End of Backend Implementation Guide**

For questions or clarifications, refer to the PRD (`docs/PRD.md`) and Design Spec (`docs/DESIGN.md`).
