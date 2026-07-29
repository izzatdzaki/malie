/**
 * Refresh legal regulation metadata from peraturan.go.id.
 *
 * Usage: npm run scrape:sync -- uu 1
 */

import {
  isRegulationType,
  saveToDatabase,
  scrapeAll,
  type RegulationType,
} from './scrapers/peraturan-go-id';

async function main() {
  const requestedType = process.argv[2] ?? 'uu';
  if (!isRegulationType(requestedType)) {
    throw new Error(`Unsupported regulation type: ${requestedType}`);
  }

  const type: RegulationType = requestedType;
  const maxPages = Number(process.argv[3] ?? process.env.SCRAPE_MAX_PAGES ?? '1');

  console.log(`[REFRESH] Scraping ${type}, ${maxPages} page(s)`);
  const regulations = await scrapeAll([type], maxPages);
  console.log(`[REFRESH] Scraped ${regulations.length} regulations`);

  if (regulations.length > 0) {
    await saveToDatabase(regulations);
  }
}

main().catch((error) => {
  console.error('[REFRESH] Failed:', error);
  process.exitCode = 1;
});
