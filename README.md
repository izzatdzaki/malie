# LegalAI Platform

Platform riset hukum berbasis AI untuk mahasiswa hukum, masyarakat umum, dan advokat profesional Indonesia.

## Fitur Utama

- **Tanya Hukum** - AI Legal Q&A dengan referensi UU, PP, dan Putusan
- **Buat Dokumen** - Generate dokumen hukum (Kontrak, MoU, Somasi, dll)
- **Review Dokumen** - Analisis risiko hukum dokumen

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + Shadcn/UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma + pgvector
- **AI**: Claude API (Anthropic) + Gemini API (Google)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb legalai

   # Enable pgvector extension
   psql -d legalai -c "CREATE EXTENSION vector;"

   # Push Prisma schema
   npx prisma db push
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth |
| `ANTHROPIC_API_KEY` | Claude API key |
| `GEMINI_API_KEY` | Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key (for embeddings) |

## Data Pipeline

Scrape regulation metadata from `peraturan.go.id`:

```bash
# Preview one page without writing to the database
npm run scrape -- uu 1

# Fetch complete metadata for one regulation
npm run scrape:detail -- uu no-3-tahun-2026

# Scrape and save to PostgreSQL (requires DATABASE_URL)
npm run scrape:sync -- uu 1

# Preview one page from the complete JDIH BPK catalog
npm run scrape:bpk -- 1

# Preview one BPK catalog page for a specific year
npm run scrape:bpk -- 1 2025
```

Supported types: `uu`, `pp`, `perpres`, `permen`, and `perda`.
The admin document page can also browse the JDIH BPK catalog by year, including
metadata, abstracts, status, subjects, and available download links.

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Main app pages
│   ├── admin/           # Admin panel
│   └── api/             # API routes
├── components/          # React components
│   ├── chat/
│   ├── drafting/
│   └── review/
├── lib/                  # Utilities and integrations
│   ├── ai/              # AI integrations (Claude, Gemini)
│   ├── db/              # Prisma client
│   └── vector/          # Vector search
└── scripts/              # Data pipeline scripts
    └── scrapers/         # Website scrapers
```

## License

MIT
