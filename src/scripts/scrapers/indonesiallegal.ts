/**
 * Scraper for Indonesian Legal documents (UU, PP, Perpres)
 * Source: Indonesia Legal (indonesialegal.com)
 *
 * Note: This is a template - adjust based on actual API structure
 */

interface LegalDocument {
  title: string;
  type: 'uu' | 'pp' | 'presiden' | 'menteri';
  content: string;
  metadata: {
    nomor: string;
    tahun: number;
    tentang?: string;
  };
  sourceUrl: string;
}

export async function scrapeUUList(page: number = 1): Promise<LegalDocument[]> {
  // Template URL - adjust based on actual API
  const url = `https://indonesialegal.com/api/uu?page=${page}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch UU list: ${response.status}`);
  }

  const data = await response.json();
  return data.documents || [];
}

export async function scrapeUUDoc(id: string): Promise<LegalDocument> {
  const url = `https://indonesialegal.com/api/uu/${id}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch UU ${id}: ${response.status}`);
  }

  return response.json();
}

export async function scrapeAllUU(): Promise<LegalDocument[]> {
  const allDocs: LegalDocument[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 100) {
    try {
      const docs = await scrapeUUList(page);
      if (docs.length === 0) {
        hasMore = false;
      } else {
        allDocs.push(...docs);
        page++;
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error);
      hasMore = false;
    }
  }

  return allDocs;
}

/**
 * Example function to save documents to database
 */
export async function saveToDatabase(docs: LegalDocument[]) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  for (const doc of docs) {
    try {
      await prisma.legalDocument.upsert({
        where: { id: doc.metadata.nomor },
        update: {
          title: doc.title,
          content: doc.content,
          metadata: doc.metadata,
        },
        create: {
          id: doc.metadata.nomor,
          title: doc.title,
          type: doc.type,
          content: doc.content,
          metadata: doc.metadata,
          sourceUrl: doc.sourceUrl,
        },
      });
      console.log(`Saved: ${doc.title}`);
    } catch (error) {
      console.error(`Error saving ${doc.title}:`, error);
    }
  }

  await prisma.$disconnect();
}

// CLI runner
if (require.main === module) {
  console.log('Starting Indonesia Legal scraper...');
  scrapeAllUU()
    .then(async (docs) => {
      console.log(`Scraped ${docs.length} documents`);
      await saveToDatabase(docs);
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
