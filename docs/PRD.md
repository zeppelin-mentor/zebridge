# Product Requirements Document (PRD)

# ZeBridge

**AI Tool Bridge for MCP, APIs, and Web**

**Version:** 1.0 - Current Implementation Status

**Last Updated:** January 2025

---

# 1. Overview

## Product Name

**ZeBridge**

## Tagline

> **Connect AI Agents to Real-World Tools.**

Alternative:

> **One Bridge. Every AI Tool.**

---

## Vision

ZeBridge is a platform that enables AI agents like Claude Code, Codex CLI, Cursor, Gemini CLI, Windsurf, and custom agents to securely perform real-world tasks through a standardized tool interface.

Instead of generating temporary scripts for every request, AI agents can invoke optimized tools through the Model Context Protocol (MCP), REST APIs, or a web dashboard.

---

# 2. Problem Statement

Today's coding agents are excellent at reasoning and code generation but lack native capabilities for operational tasks such as:

* Editing PDFs
* Converting Office documents
* Removing image backgrounds
* OCR
* Invoice generation
* Barcode generation
* Compressing files
* Image upscaling

To perform these tasks they often generate one-off scripts, install packages, and execute commands, resulting in:

* Slow execution
* Inconsistent output
* Higher token usage
* Security concerns
* Poor reliability

Developers need a centralized platform exposing production-ready tools that AI agents can invoke directly.

---

# 3. Solution

ZeBridge provides a unified platform where tools are exposed through:

* MCP Server (`/mcp`)
* REST API (`/v1`)
* Web Dashboard

Every tool is implemented once and becomes available across all interfaces.

---

# 4. Goals

### Primary Goals

* Build the largest collection of AI-ready tools.
* Become the default MCP provider for developers.
* Offer production-grade file and document processing.
* Reduce AI-generated boilerplate scripts.
* Support all major AI coding assistants.

---

### Success Metrics

* Number of registered developers
* Daily MCP requests
* Daily tool executions
* API usage
* Active workspaces
* Conversion to paid plans
* Average execution latency

---

# 5. Target Audience

## Primary

* AI Developers
* Full Stack Developers
* SaaS Builders
* Open Source Maintainers

## Secondary

* Businesses
* Universities
* Agencies
* Automation Engineers

---

# 6. Supported Clients

* Claude Code
* Codex CLI
* Cursor
* Gemini CLI
* Windsurf
* VS Code Extensions
* OpenAI Agents SDK
* LangChain
* CrewAI
* AutoGen
* Custom MCP Clients

---

# 7. Core Features

## 7.1 MCP Server

Endpoint

```
/mcp
```

Capabilities

* Tool discovery
* Tool execution
* Authentication
* File uploads
* Streaming
* Async jobs

---

## 7.2 REST API

### ✅ Implemented Endpoints

**PDF Tools:**
```
POST /v1/tools/pdf-merge           ✅ Implemented
POST /v1/tools/pdf-split           ✅ Implemented
POST /v1/tools/markdown-to-pdf     ✅ Implemented
POST /v1/tools/html-to-pdf         ✅ Implemented
```

**Image Tools:**
```
POST /v1/tools/remove-background   ✅ Implemented
POST /v1/tools/image-upscale       ✅ Implemented
```

**Office Document Tools:**
```
POST /v1/tools/text-to-docx        ✅ Implemented
POST /v1/tools/json-to-excel       ✅ Implemented (CSV format)
POST /v1/tools/generate-receipt    ✅ Implemented
```

**AI Tools:**
```
POST /v1/tools/generate-qrcode     ✅ Implemented
POST /v1/tools/ocr-extract-text    ✅ Implemented (placeholder)
POST /v1/tools/generate-invoice    ✅ Implemented
```

**User Management:**
```
GET  /v1/user/stats                ✅ Implemented
POST /v1/user/api-keys             ✅ Implemented
GET  /v1/user/api-keys             ✅ Implemented
DELETE /v1/user/api-keys/:id       ✅ Implemented
```

**Health Check:**
```
GET  /health                       ✅ Implemented
```

---

## 7.3 Dashboard

### ✅ Implemented Features

**Authentication:**
* ✅ Login page with Supabase Auth
* ✅ Signup page with email validation
* ✅ Session management
* ✅ Logout functionality

**User Dashboard:**
* ✅ Overview tab with real-time stats
* ✅ Recent executions display
* ✅ Usage metrics (total executions, tools used, storage)
* ✅ Quick actions

**Tools Tab:**
* ✅ Tool registry with 12 working tools
* ✅ Category filtering (PDF, Images, Office, AI)
* ✅ Search functionality
* ✅ Sandbox execution console
* ✅ Mock file upload preview
* ✅ Execution logs display
* ✅ Progress tracking

**API Keys Tab:**
* ✅ Create new API keys
* ✅ View existing keys (masked)
* ✅ Revoke keys
* ✅ Copy to clipboard
* ✅ Usage statistics per key

**Audit Logs Tab:**
* ✅ Real-time execution logs from database
* ✅ Filter by status, tool, date range
* ✅ Export to CSV
* ✅ Pagination

**Agents Tab:**
* ✅ Active assistants display (Kiro IDE)
* ✅ MCP server status
* ✅ Integration guides

**Profile Page:**
* ✅ User information display
* ✅ Plan details
* ✅ Account settings

**Layout:**
* ✅ Fixed sidebar navigation
* ✅ Sticky header
* ✅ Scrollable content areas
* ✅ Responsive design

---

# 8. Tool Categories - Implementation Status

## PDF Tools

* ✅ **Merge PDFs** - Combines multiple PDFs into one
* ✅ **Split PDF** - Splits PDF by page ranges or individual pages
* ✅ **Markdown → PDF** - Converts Markdown to formatted PDF
* ✅ **HTML → PDF** - Converts HTML to PDF
* ⏳ Compress - Planned
* ⏳ OCR - Placeholder implemented
* ⏳ Rotate - Planned
* ⏳ Watermark - Planned
* ⏳ Unlock - Planned
* ⏳ Protect - Planned
* ⏳ PDF → Word - Placeholder implemented
* ⏳ Word → PDF - Planned
* ⏳ PDF → Excel - Planned
* ⏳ PDF → Images - Planned

---

## Image Tools

* ✅ **Background Removal** - Basic implementation with Sharp
* ✅ **Image Upscale** - 2x/4x upscaling with Lanczos3
* ⏳ Compress - Planned
* ⏳ Resize - Planned
* ⏳ Crop - Planned
* ⏳ Watermark - Planned
* ⏳ Convert Formats - Planned
* ⏳ AI Enhancement - Planned
* ⏳ Blur Removal - Planned

---

## Office Documents

* ✅ **Text → DOCX** - Basic XML-based DOCX generation
* ✅ **JSON → Excel** - Converts JSON to CSV format
* ✅ **Generate Receipt** - Professional receipt PDF generation
* ⏳ DOCX → PDF - Planned
* ⏳ PPT → PDF - Planned
* ⏳ XLSX → CSV - Planned
* ⏳ HTML → DOCX - Planned

---

## AI Tools

* ✅ **QR Code Generator** - High-resolution QR codes
* ✅ **Generate Invoice** - Professional invoice PDF with itemization
* ✅ **OCR Extract Text** - Placeholder (needs OCR service integration)
* ⏳ Summarize Documents - Planned
* ⏳ Translate - Planned
* ⏳ Extract Tables - Planned
* ⏳ Extract Entities - Planned
* ⏳ Invoice Parsing - Planned
* ⏳ Contract Analysis - Planned

---

## Utilities

* ⏳ Barcode Generator - Planned
* ⏳ UUID Generator - Planned
* ⏳ Password Generator - Planned
* ⏳ JSON Formatter - Planned
* ⏳ CSV Formatter - Planned
* ⏳ XML Formatter - Planned

---

# 9. Architecture

```
AI Client
     │
     ▼
----------------------
       /mcp
----------------------
     MCP Server
     │
     ▼
Tool Dispatcher
     │
───────────────
│     │      │
PDF  Image  AI
│     │      │
───────────────
     │
 Worker Queue
     │
     ▼
 Storage
     │
     ▼
 Supabase
```

---

# 10. Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

* ✅ Next.js 16.2.9 Route Handlers
* ✅ MCP SDK (@modelcontextprotocol/sdk)
* ✅ Zod validation
* ✅ TypeScript
* ✅ pdf-lib for PDF manipulation
* ✅ Sharp for image processing
* ✅ qrcode for QR generation

---

## Database

✅ **Supabase PostgreSQL** - Fully configured

**Tables Implemented:**
* ✅ users - User accounts
* ✅ api_keys - API key management
* ✅ tools - Tool registry (10 tools seeded)
* ✅ executions - Execution logs with auto-expiry (90 days)
* ✅ files - File metadata with auto-expiry (30 days)
* ✅ usage - Monthly usage tracking

**Functions:**
* ✅ increment_usage
* ✅ get_user_stats
* ✅ cleanup_expired_executions
* ✅ cleanup_expired_files
* ✅ validate_api_key
* ✅ revoke_api_key
* ✅ get_monthly_usage

---

## Storage

✅ **Supabase Storage** - Configured with 100MB limit

**Buckets:**
* ✅ uploads - Input files
* ✅ outputs - Generated files
* ✅ temp - Temporary storage

**Policies:**
* ✅ RLS (Row Level Security) enabled
* ✅ Authenticated uploads
* ✅ Public read for outputs
* ✅ Automatic cleanup utilities

---

## Queue

⏳ **BullMQ** - Deferred to v2.0
⏳ **Redis** - Deferred to v2.0

**Current Implementation:** Synchronous processing in API routes

---

## Authentication

✅ **Supabase Auth** - Fully integrated

**Implemented:**
* ✅ Email/Password authentication
* ✅ Session management with cookies
* ✅ Server-side auth validation
* ✅ API key authentication for REST/MCP
* ✅ Protected routes with middleware

**Planned:**
* ⏳ Google OAuth
* ⏳ GitHub OAuth
* ⏳ Magic link authentication

---

# 11. Database Schema - Current Implementation

## ✅ Users

```sql
id               UUID PRIMARY KEY
email            TEXT UNIQUE
full_name        TEXT
plan             TEXT (free/pro/team/enterprise)
created_at       TIMESTAMP
updated_at       TIMESTAMP
```

---

## ✅ API Keys

```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES users
name             TEXT
key_hash         TEXT UNIQUE
prefix           TEXT (first 8 chars for display)
last_used_at     TIMESTAMP
created_at       TIMESTAMP
revoked          BOOLEAN DEFAULT false
```

---

## ✅ Tools

```sql
id               UUID PRIMARY KEY
slug             TEXT UNIQUE
name             TEXT
description      TEXT
category         TEXT (pdf/image/office/ai)
enabled          BOOLEAN
premium          BOOLEAN
metadata         JSONB
created_at       TIMESTAMP
```

**Seeded Tools (10):**
1. pdf-merge
2. pdf-split
3. remove-background
4. image-upscale
5. text-to-docx
6. markdown-to-pdf
7. generate-receipt
8. html-to-pdf
9. json-to-excel
10. generate-qrcode

---

## ✅ Executions

```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES users
api_key_id       UUID REFERENCES api_keys
tool_slug        TEXT REFERENCES tools(slug)
status           TEXT (processing/success/failed)
input_params     JSONB
output_metadata  JSONB
duration_ms      INTEGER
error_message    TEXT
created_at       TIMESTAMP
completed_at     TIMESTAMP
expires_at       TIMESTAMP (auto: created_at + 90 days)
```

**Auto-cleanup:** Executions older than 90 days are automatically deleted

---

## ✅ Files

```sql
id               UUID PRIMARY KEY
execution_id     UUID REFERENCES executions
user_id          UUID REFERENCES users
bucket           TEXT (uploads/outputs/temp)
path             TEXT
filename         TEXT
size             BIGINT
mime_type        TEXT
public_url       TEXT
created_at       TIMESTAMP
expires_at       TIMESTAMP (auto: created_at + 30 days)
```

**Auto-cleanup:** Files older than 30 days are automatically deleted

---

## ✅ Usage

```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES users
month            TEXT (YYYY-MM format)
total_executions INTEGER DEFAULT 0
storage_bytes    BIGINT DEFAULT 0
tools_used       JSONB
created_at       TIMESTAMP
updated_at       TIMESTAMP
```

---

# 12. Authentication - Implementation

## ✅ Dashboard Authentication

* **Method:** Supabase Auth with JWT cookies
* **Flow:** Email/password → JWT stored in httpOnly cookies
* **Protected Routes:** All `/dashboard/*` routes
* **Middleware:** `proxy.ts` validates sessions

---

## ✅ REST API Authentication

**Header:**
```
Authorization: Bearer zbk_live_xxxxxxxxxxxxxxxx
```

**Validation:**
* API key format validated
* Key hash checked against database
* User association verified
* Rate limiting applied per user
* Last used timestamp updated

---

## ✅ MCP Authentication

**Header:**
```
Authorization: Bearer zbk_live_xxxxxxxxxxxxxxxx
```

**Same validation as REST API**
* MCP endpoint `/mcp` requires valid API key
* Tools executed with user context
* All executions logged to database

---

# 13. Pricing

## Free

* 25 executions/day
* 100 MB Storage
* Community Support
* Basic Tools

---

## Pro

* Unlimited Requests
* Faster Queue
* Premium Tools
* Larger Uploads
* API Access

---

## Team

* Shared Workspace
* Team Members
* Audit Logs
* Usage Analytics

---

## Enterprise

* Dedicated MCP
* Self Hosted
* SLA
* SSO
* Custom Integrations

---

# 14. Security - Current Implementation

## ✅ Implemented

* ✅ **API Key Authentication** - Secure key generation with SHA-256 hashing
* ✅ **Rate Limiting** - Basic implementation (plan-based limits)
* ✅ **Temporary File Storage** - Auto-expiry after 30 days
* ✅ **Automatic File Cleanup** - Database functions for expired data
* ✅ **Audit Logs** - All executions logged with timestamps
* ✅ **RLS (Row Level Security)** - Supabase policies enforced
* ✅ **Input Validation** - Zod schemas for all API inputs
* ✅ **Error Handling** - Structured error responses
* ✅ **CORS Configuration** - Controlled access for MCP clients
* ✅ **Environment Variables** - Secrets stored securely

## ⏳ Planned

* ⏳ Signed URLs for file downloads
* ⏳ Virus scanning on uploads
* ⏳ Advanced rate limiting with Redis
* ⏳ Request signing for MCP
* ⏳ Webhook verification
* ⏳ IP whitelisting

---

# 15. Roadmap

### ✅ Phase 1 — MVP (Current - v1.0)

**Completed:**
* ✅ MCP Server (`/mcp`) with tool registry
* ✅ REST API (`/v1`) with 12 working endpoints
* ✅ Authentication (Supabase Auth + API Keys)
* ✅ Dashboard with 6 tabs (Overview, Tools, Keys, Logs, Agents, Profile)
* ✅ API Key management (create, revoke, view)
* ✅ 12 working tools:
  - PDF: merge, split, markdown-to-pdf, html-to-pdf
  - Images: background removal, upscaling
  - Office: text-to-docx, json-to-excel, receipt generation
  - AI: QR codes, invoice generation, OCR placeholder
* ✅ Usage Dashboard with real-time stats
* ✅ Supabase Integration (Database + Storage)
* ✅ Audit logs with filtering and export
* ✅ File storage with auto-cleanup
* ✅ Rate limiting (basic)

**In Progress:**
* 🔄 OCR implementation (placeholder exists)
* 🔄 PDF to Word conversion (placeholder exists)

**Deferred to v2.0:**
* BullMQ/Redis queue system
* OAuth providers (Google, GitHub)
* Advanced rate limiting

---

### ⏳ Phase 2 — v2.0 (Planned)

* Async job processing with BullMQ + Redis
* OAuth authentication (Google, GitHub)
* More tools (compress, blur removal, watermarks)
* Batch processing
* Webhooks for job completion
* Team workspaces
* CLI tool
* Advanced analytics
* Stripe payment integration

---

### ⏳ Phase 3 — v3.0 (Future)

* Tool Marketplace
* Community Tool SDK
* Custom user tools
* Bring Your Own Model (BYOM)
* Bring Your Own Storage (BYOS)
* Workflow automation
* No-code tool builder
* Enterprise features (SSO, dedicated instances)

---

# 16. Future Vision

ZeBridge evolves beyond an MCP server into a universal execution layer for AI agents. Whether an agent needs to process a document, manipulate an image, analyze data, or automate a business workflow, it should use ZeBridge as the trusted execution platform instead of generating disposable scripts. Long term, ZeBridge aims to become the infrastructure layer that powers AI-native applications, enabling developers to expose custom tools, monetize them through a marketplace, and integrate them seamlessly across MCP, REST APIs, and future agent protocols. This positions ZeBridge as a foundational platform for AI tooling, similar to how Stripe abstracts payments or Vercel simplifies application deployment.
