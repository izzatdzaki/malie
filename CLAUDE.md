# CLAUDE.md

This file provides guidance to Claude Code (claude.ai) about this codebase.

## Project Overview

LegalAI is a legal tech platform for Indonesian users (law students, general public, professional lawyers) that provides AI-powered legal assistance including:
- Legal Q&A with references to Indonesian laws and court decisions
- Legal document drafting (contracts, MoU, demand letters, etc.)
- Document review with risk analysis

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL with Prisma ORM and pgvector extension
- **AI**: Claude (Anthropic) for Q&A and document review; Gemini (Google) for document drafting
- **Embeddings**: OpenAI text-embedding-3-small (for RAG)

## Key Architecture Decisions

### Database
- PostgreSQL with pgvector for vector similarity search
- Prisma as ORM
- Connection pooling via Prisma

### AI Integration
- Claude for: Legal Q&A, Document Review (uses RAG for context)
- Gemini for: Document Drafting (template-based generation)

### RAG (Retrieval Augmented Generation)
- Documents are chunked and embedded
- Stored in PostgreSQL with pgvector
- Retrieved based on semantic similarity to query
- Context passed to Claude for answer generation

## Important Files

- `prisma/schema.prisma` - Database schema
- `src/lib/ai/claude.ts` - Claude integration
- `src/lib/ai/gemini.ts` - Gemini integration and document templates
- `src/lib/vector/search.ts` - Vector search implementation
- `src/app/api/chat/route.ts` - Main chat endpoint

## Development Workflow

1. Make code changes
2. Run `npm run dev` to start dev server
3. Test at http://localhost:3000

## Database Commands

```bash
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema to database
npx prisma db studio    # Open Prisma Studio
```

## Data Pipeline

Scrapers are in `src/scripts/scrapers/` and can be run with ts-node.
Embeddings use OpenAI API and require valid API key in .env.

## Design System

- Primary color: #1E3A5F (Navy)
- Secondary color: #2563EB (Blue)
- Accent color: #059669 (Emerald)
- Background: #FAFBFC
- Border: #E5E7EB
