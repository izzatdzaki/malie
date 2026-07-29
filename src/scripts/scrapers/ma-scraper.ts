/**
 * Scraper for Supreme Court (MA) decisions
 * Source: https://putusan.mahkamahagung.go.id
 *
 * Note: This is a template - adjust based on actual website structure
 */

import { PrismaClient } from '@prisma/client';

interface CourtDecision {
  caseNumber: string;
  court: string;
  judges: string[];
  parties: string[];
  decisionDate: string;
  verdict: string;
  legalConsideration?: string;
  sourceUrl: string;
}

export async function scrapePutusanList(
  court: string = 'ptun',
  page: number = 1
): Promise<CourtDecision[]> {
  // Template URL - adjust based on actual website
  const url = `https://putusan.mahkamahagung.go.id/api/${court}?page=${page}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${court} list: ${response.status}`);
  }

  const data = await response.json();
  return data.decisions || [];
}

export async function scrapePutusanDetail(caseNumber: string): Promise<CourtDecision> {
  const url = `https://putusan.mahkamahagung.go.id/api/putusan/${caseNumber}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch case ${caseNumber}: ${response.status}`);
  }

  return response.json();
}

export async function scrapeCourtType(court: string, maxPages: number = 10): Promise<CourtDecision[]> {
  const allDecisions: CourtDecision[] = [];

  for (let page = 1; page <= maxPages; page++) {
    try {
      const decisions = await scrapePutusanList(court, page);
      if (decisions.length === 0) break;

      allDecisions.push(...decisions);

      // Rate limiting - be respectful to the server
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`[${court}] Scraped page ${page}, total: ${allDecisions.length}`);
    } catch (error) {
      console.error(`[${court}] Error on page ${page}:`, error);
      break;
    }
  }

  return allDecisions;
}

export async function scrapeAllCourts(): Promise<CourtDecision[]> {
  const courts = ['ptun', 'phi', 'pilkada'];
  const allDecisions: CourtDecision[] = [];

  for (const court of courts) {
    console.log(`Scraping ${court}...`);
    const decisions = await scrapeCourtType(court, 50);
    allDecisions.push(...decisions);
    console.log(`[${court}] Total: ${decisions.length}`);
  }

  return allDecisions;
}

/**
 * Example function to save decisions to database
 */
export async function saveDecisionsToDatabase(decisions: CourtDecision[]) {
  const prisma = new PrismaClient();

  for (const dec of decisions) {
    try {
      await prisma.courtDecision.upsert({
        where: { id: dec.caseNumber },
        update: {
          verdict: dec.verdict,
          legalConsideration: dec.legalConsideration,
        },
        create: {
          id: dec.caseNumber,
          caseNumber: dec.caseNumber,
          court: dec.court,
          judges: dec.judges,
          parties: dec.parties,
          decisionDate: new Date(dec.decisionDate),
          verdict: dec.verdict,
          legalConsideration: dec.legalConsideration,
          sourceUrl: dec.sourceUrl,
        },
      });
      console.log(`Saved: ${dec.caseNumber}`);
    } catch (error) {
      console.error(`Error saving ${dec.caseNumber}:`, error);
    }
  }

  await prisma.$disconnect();
}

// CLI runner
if (require.main === module) {
  console.log('Starting MA Scraper...');
  scrapeAllCourts()
    .then(async (decisions) => {
      console.log(`Scraped ${decisions.length} decisions`);
      await saveDecisionsToDatabase(decisions);
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
