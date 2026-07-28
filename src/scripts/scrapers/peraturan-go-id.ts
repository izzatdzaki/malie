/**
 * Scraper for peraturan.go.id
 * Source: https://peraturan.go.id
 *
 * Data tersedia:
 * - UU (Undang-Undang)
 * - PP (Peraturan Pemerintah)
 * - Perpres (Peraturan Presiden)
 * - Permen (Peraturan Menteri)
 * - Perda (Peraturan Daerah)
 */

interface Regulation {
  title: string;
  type: 'uu' | 'pp' | 'perpres' | 'permen' | 'perda';
  number: string;
  year: number;
  tentang?: string;
  status?: string;
  pdfUrl?: string;
  detailUrl: string;
}

interface DetailInfo {
  title: string;
  type: string;
  number: string;
  year: number;
  tentang?: string;
  status?: string;
  ditetapkan?: {
    tempat?: string;
    tanggal?: string;
    pejabat?: string;
  };
  diundangkan?: {
    tanggal?: string;
    pejabat?: string;
  };
  nomorLembaranNegara?: string;
  pdfUrl?: string;
}

// Types that can be scraped
const REGULATION_TYPES = ['uu', 'pp', 'perpres', 'permen', 'perda'] as const;

/**
 * Scrape list of regulations from a specific type
 */
export async function scrapeRegulationList(
  type: typeof REGULATION_TYPES[number],
  page: number = 1
): Promise<Regulation[]> {
  const url = `https://peraturan.go.id/${type}${page > 1 ? `?page=${page}` : ''}`;

  console.log(`Scraping ${type} from: ${url}`);

  // Note: In production, use fetch with proper error handling
  // This is a template - actual implementation would use cheerio or similar
  // to parse the HTML response

  // Example structure:
  // const response = await fetch(url);
  // const html = await response.text();
  // const $ = cheerio.load(html);
  // const regulations = [];
  //
  // $('.table-data tbody tr').each((i, el) => {
  //   const title = $(el).find('td:nth-child(1)').text();
  //   const number = $(el).find('td:nth-child(2)').text();
  //   // ...
  // });

  return [];
}

/**
 * Scrape detail page for a specific regulation
 */
export async function scrapeRegulationDetail(
  type: string,
  slug: string
): Promise<DetailInfo | null> {
  const url = `https://peraturan.go.id/id/${type}-${slug}`;

  console.log(`Scraping detail from: ${url}`);

  // Example structure after parsing:
  // return {
  //   title: "Undang-Undang Nomor 3 Tahun 2026",
  //   type: "uu",
  //   number: "3",
  //   year: 2026,
  //   tentang: "Pelindungan Saksi dan Korban",
  //   status: "Berlaku",
  //   ditetapkan: {
  //     tempat: "Jakarta",
  //     tanggal: "20 Mei 2026",
  //     pejabat: "Prabowo Subianto"
  //   },
  //   pdfUrl: "https://peraturan.go.id/files/uu-no-3-tahun-2026.pdf"
  // };

  return null;
}

/**
 * Get PDF download URL from regulation type and number
 */
export function getPdfUrl(type: string, number: string, year: number): string {
  // Pattern for PDF URLs based on observed structure
  const patterns: Record<string, string> = {
    'uu': `https://peraturan.go.id/files/uu-no-${number}-tahun-${year}.pdf`,
    'pp': `https://peraturan.go.id/files/pp-no-${number}-tahun-${year}.pdf`,
    'perpres': `https://peraturan.go.id/files/perpres-no-${number}-tahun-${year}.pdf`,
    'permen': `https://peraturan.go.id/files/permen-no-${number}-tahun-${year}.pdf`,
  };

  return patterns[type] || '';
}

/**
 * Main scraper function for all regulation types
 */
export async function scrapeAll(
  types: typeof REGULATION_TYPES[number][] = [...REGULATION_TYPES]
): Promise<Regulation[]> {
  const allRegulations: Regulation[] = [];

  for (const type of types) {
    console.log(`\n=== Scraping ${type.toUpperCase()} ===`);

    let page = 1;
    let hasMore = true;
    let count = 0;

    while (hasMore && page <= 100) {
      try {
        const regulations = await scrapeRegulationList(type, page);

        if (regulations.length === 0) {
          hasMore = false;
        } else {
          allRegulations.push(...regulations);
          count += regulations.length;
          console.log(`Page ${page}: ${regulations.length} items (Total: ${count})`);
          page++;

          // Rate limiting - be respectful to the server
          await sleep(2000);
        }
      } catch (error) {
        console.error(`Error on page ${page}:`, error);
        hasMore = false;
      }
    }

    console.log(`[${type.toUpperCase()}] Total scraped: ${count}`);
  }

  return allRegulations;
}

/**
 * Save regulations to database
 */
export async function saveToDatabase(regulations: Regulation[]) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  let saved = 0;
  let errors = 0;

  for (const reg of regulations) {
    try {
      await prisma.legalDocument.upsert({
        where: {
          id: `${reg.type}-${reg.number}-${reg.year}`,
        },
        update: {
          title: reg.title,
          summary: reg.tentang,
          metadata: {
            nomor: reg.number,
            tahun: reg.year,
            tentang: reg.tentang,
            status: reg.status,
          },
          sourceUrl: reg.detailUrl,
        },
        create: {
          id: `${reg.type}-${reg.number}-${reg.year}`,
          title: reg.title,
          type: reg.type,
          content: '', // Full content downloaded from PDF separately
          summary: reg.tentang,
          metadata: {
            nomor: reg.number,
            tahun: reg.year,
            tentang: reg.tentang,
            status: reg.status,
          },
          sourceUrl: reg.detailUrl,
        },
      });

      saved++;
      console.log(`Saved: ${reg.title}`);
    } catch (error) {
      errors++;
      console.error(`Error saving ${reg.title}:`, error);
    }
  }

  console.log(`\nDatabase save complete: ${saved} saved, ${errors} errors`);
  await prisma.$disconnect();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// CLI runner
const args = process.argv.slice(2);
const command = args[0] || 'all';
const type = args[1] || 'uu';

(async () => {
  console.log('===========================================');
  console.log(`Scraper: peraturan.go.id`);
  console.log(`Command: ${command}`);
  console.log(`Type: ${type}`);
  console.log('===========================================\n');

  try {
    switch (command) {
      case 'scrape':
        if (type === 'all') {
          await scrapeAll();
        } else if (REGULATION_TYPES.includes(type as any)) {
          const regulations = await scrapeRegulationList(type as any);
          console.log(`Scraped ${regulations.length} ${type} regulations`);
        }
        break;

      case 'scrape-detail':
        const detail = await scrapeRegulationDetail(type, args[2] || '');
        console.log('Detail:', detail);
        break;

      case 'all':
      default:
        const all = await scrapeAll();
        console.log(`\nTotal scraped: ${all.length}`);
        if (all.length > 0) {
          await saveToDatabase(all);
        }
    }

    console.log('\n===========================================');
    console.log('Scraping complete!');
    console.log('===========================================');
    process.exit(0);
  } catch (error) {
    console.error('Scraper failed:', error);
    process.exit(1);
  }
})();
