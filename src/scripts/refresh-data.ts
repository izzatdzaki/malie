/**
 * Data refresh script
 * Run this periodically to keep data up to date
 *
 * Usage: npx ts-node scripts/refresh-data.ts
 */

import { scrapeAllUU } from './scrapers/indonesiallegal';
import { scrapeAllCourts } from './scrapers/ma-scraper';
import { saveToDatabase } from './scrapers/indonesiallegal';
import { saveDecisionsToDatabase } from './scrapers/ma-scraper';

async function refreshDocuments() {
  console.log('[REFRESH] Starting document refresh...');
  console.time('document-refresh');

  try {
    // Scrape new UU
    console.log('[REFRESH] Scraping UU documents...');
    const uuDocs = await scrapeAllUU();
    console.log(`[REFRESH] Scraped ${uuDocs.length} UU documents`);

    // Save to database
    if (uuDocs.length > 0) {
      await saveToDatabase(uuDocs);
      console.log('[REFRESH] UU documents saved to database');
    }

    console.timeEnd('document-refresh');
  } catch (error) {
    console.error('[REFRESH] Error refreshing documents:', error);
  }
}

async function refreshCourtDecisions() {
  console.log('[REFRESH] Starting court decision refresh...');
  console.time('court-refresh');

  try {
    // Scrape court decisions
    console.log('[REFRESH] Scraping court decisions...');
    const decisions = await scrapeAllCourts();
    console.log(`[REFRESH] Scraped ${decisions.length} court decisions`);

    // Save to database
    if (decisions.length > 0) {
      await saveDecisionsToDatabase(decisions);
      console.log('[REFRESH] Court decisions saved to database');
    }

    console.timeEnd('court-refresh');
  } catch (error) {
    console.error('[REFRESH] Error refreshing court decisions:', error);
  }
}

async function fullRefresh() {
  console.log('===========================================');
  console.log('[REFRESH] Starting full data refresh');
  console.log(`[REFRESH] Time: ${new Date().toISOString()}`);
  console.log('===========================================');

  await refreshDocuments();
  await refreshCourtDecisions();

  console.log('===========================================');
  console.log('[REFRESH] Full refresh complete!');
  console.log('===========================================');
}

// CLI runner
const command = process.argv[2] || 'all';

(async () => {
  try {
    switch (command) {
      case 'documents':
        await refreshDocuments();
        break;
      case 'courts':
        await refreshCourtDecisions();
        break;
      case 'all':
      default:
        await fullRefresh();
    }
    process.exit(0);
  } catch (error) {
    console.error('[REFRESH] Refresh failed:', error);
    process.exit(1);
  }
})();
