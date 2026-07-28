import prisma from '@/lib/db';

export interface SearchResult {
  id: string;
  type: 'uu' | 'pp' | 'putusan';
  title: string;
  snippet: string;
  sourceUrl?: string;
}

// For now, use simple text search since pgvector requires extension setup
export async function searchLegalDocuments(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  // Simple LIKE search - in production, use pgvector for semantic search
  const docs = await prisma.legalDocument.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    select: {
      id: true,
      title: true,
      type: true,
      content: true,
      summary: true,
      sourceUrl: true,
    },
  });

  return docs.map((doc) => ({
    id: doc.id,
    type: doc.type as 'uu' | 'pp' | 'putusan',
    title: doc.title,
    snippet: doc.summary || doc.content.slice(0, 300),
    sourceUrl: doc.sourceUrl || undefined,
  }));
}

export async function searchCourtDecisions(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const decisions = await prisma.courtDecision.findMany({
    where: {
      OR: [
        { caseNumber: { contains: query, mode: 'insensitive' } },
        { verdict: { contains: query, mode: 'insensitive' } },
        { parties: { hasSome: [query] } },
      ],
    },
    take: limit,
    select: {
      id: true,
      caseNumber: true,
      court: true,
      verdict: true,
      sourceUrl: true,
    },
  });

  return decisions.map((dec) => ({
    id: dec.id,
    type: 'putusan' as const,
    title: `Putusan ${dec.court.toUpperCase()} - ${dec.caseNumber}`,
    snippet: dec.verdict.slice(0, 300),
    sourceUrl: dec.sourceUrl || undefined,
  }));
}

export async function searchAll(
  query: string,
  limit: number = 5
): Promise<{ docs: SearchResult[]; decisions: SearchResult[] }> {
  const [docs, decisions] = await Promise.all([
    searchLegalDocuments(query, limit),
    searchCourtDecisions(query, limit),
  ]);

  return { docs, decisions };
}
