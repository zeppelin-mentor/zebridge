# ZeBridge - Universal Tooling for AI Agents

## Project Overview

ZeBridge is a universal tooling platform that connects AI agents (like Claude, Cursor, Windsurf, and Gemini) to secure, real-world tools via the Model Context Protocol (MCP). Built by Zeppelin Labs, it provides both an MCP server and REST API endpoints for seamless integration.

## Key Features

- **Model Context Protocol (MCP) Server**: Native integration with MCP-compatible AI agents
- **REST API Endpoints**: Traditional API access for broader compatibility
- **PDF Manipulation Tools**: Merge, split, and convert PDF documents
- **Image Processing**: Background removal, upscaling, and optimization
- **Document Generation**: Create DOCX, PDF, invoices, and receipts
- **QR Code Generator**: Generate QR codes for various use cases
- **OCR Text Extraction**: Extract text from images using OCR technology
- **Secure API Key Authentication**: Protected access to all tools and features

## Technical Stack

- **Framework**: Next.js 16.2.9 (React 19.2.4)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend Services**: Supabase (Authentication & Database)
- **Queue System**: Upstash QStash for async operations
- **Document Processing**: docx, pdf-lib, pptxgenjs
- **Image Processing**: Sharp
- **Email**: Nodemailer
- **MCP Integration**: @modelcontextprotocol/sdk

## Project Structure

The application follows Next.js App Router architecture with:

- `/app/v1/tools/*` - REST API endpoints for all tools
- `/app/dashboard/*` - User dashboard with tool management
- `/app/admin/*` - Administrative panel
- `/app/mcp/` - Model Context Protocol server endpoint
- `/components/*` - Reusable React components
- `/lib/*` - Utility functions and business logic

## Available Tools

1. **PDF Tools**: Merge, split, PDF to DOCX conversion
2. **Image Tools**: Background removal, upscaling, OCR
3. **Document Generation**: Text to DOCX, Markdown to PDF, HTML to PDF
4. **Template Filling**: DOCX template filler, email template generator
5. **Business Documents**: Invoice and receipt generation
6. **Data Conversion**: JSON to Excel, CSV to JSON, Excel to JSON
7. **Utilities**: QR code generation, webhook sending, email sending

## Deployment & Development

- **Development**: `npm run dev` - Runs on localhost:3000
- **Build**: `npm run build` - Production build
- **Deployment**: Optimized for Vercel Platform
- **Environment**: Requires Supabase and Upstash credentials

## Target Users

- AI Agent Developers
- Automation Engineers
- Productivity Tool Builders
- Document Processing Applications
- Integration Developers

## Organization

**Zeppelin Labs**
- Email: team@zeppelinlabs.digital
- Website: https://zeppelinlabs.digital
- Mission: Building tools that connect AI agents to the real world

## Categories

- Developer Tools
- Productivity
- Utilities
- AI Integration Platform

## Rating

Aggregate Rating: 5.0/5.0 (based on 1 review)

---

*Generated on: 2026-07-11*
*Version: 0.1.0*
