/**
 * Scraper for the public regulation catalog at peraturan.go.id.
 *
 * Usage:
 *   npm run scrape -- uu 1
 *   npm run scrape:detail -- uu no-3-tahun-2026
 *   npm run scrape:sync -- uu 1
 */

import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://peraturan.go.id';
export const REGULATION_TYPES = [
  'uu',
  'pp',
  'perpres',
  'permen',
  'perda',
] as const;
const REQUEST_HEADERS = {
  accept: 'text/html,application/xhtml+xml',
  'user-agent': 'LegalAI data scraper/1.0',
};

export type RegulationType = typeof REGULATION_TYPES[number];

export interface Regulation {
  title: string;
  type: RegulationType;
  number: string;
  year: number;
  tentang: string;
  status?: string;
  pdfUrl?: string;
  detailUrl: string;
}

export interface RegulationPage {
  regulations: Regulation[];
  hasNext: boolean;
  pageNumbers: number[];
}

export interface DetailInfo {
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
  nomorTambahanLembaranNegara?: string;
  pdfUrl?: string;
  detailUrl: string;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function absoluteUrl(value?: string): string | undefined {
  return value ? new URL(value, BASE_URL).toString() : undefined;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

export function isRegulationType(value: string): value is RegulationType {
  return REGULATION_TYPES.some((type) => type === value);
}

export async function scrapeRegulationPage(
  type: RegulationType,
  page = 1
): Promise<RegulationPage> {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Invalid page number: ${page}`);
  }

  const url = new URL(`/${type}`, BASE_URL);
  url.searchParams.set('page', String(page));

  console.log(`Scraping ${type} page ${page}: ${url}`);
  const html = await fetchHtml(url.toString());
  const $ = cheerio.load(html);
  const regulations: Regulation[] = [];

  $('.strip.grid').each((_index, element) => {
    const card = $(element);
    const detailLink = card.find('a[title="lihat detail"]').first();
    const detailHref = detailLink.attr('href');
    const descriptor = normalizeText(card.find('.wrapper > p').first().text());
    const match = descriptor.match(/Nomor\s+(.+?)\s+Tahun\s+(\d{4})/i);

    if (!detailHref || !match) {
      return;
    }

    const pdfHref = card.find('a[href*="/files/"]').first().attr('href');
    const title = normalizeText(detailLink.text());

    regulations.push({
      title: descriptor,
      type,
      number: match[1],
      year: Number(match[2]),
      tentang: title,
      pdfUrl: absoluteUrl(pdfHref),
      detailUrl: absoluteUrl(detailHref) as string,
    });
  });

  if ($('.strip.grid').length > 0 && regulations.length === 0) {
    throw new Error(`Page structure changed; no ${type} records could be parsed`);
  }

  const pageNumbers = [
    ...new Set(
      $('.pagination a[data-page]')
        .map((_index, element) => Number(normalizeText($(element).text())))
        .get()
        .filter((value) => Number.isInteger(value) && value > 0)
    ),
  ].sort((a, b) => a - b);

  if (!pageNumbers.includes(page)) {
    pageNumbers.push(page);
    pageNumbers.sort((a, b) => a - b);
  }

  return {
    regulations,
    hasNext: $('.pagination li.next:not(.disabled)').length > 0,
    pageNumbers,
  };
}

export async function scrapeRegulationList(
  type: RegulationType,
  page = 1
): Promise<Regulation[]> {
  return (await scrapeRegulationPage(type, page)).regulations;
}

export async function scrapeRegulationDetail(
  type: RegulationType,
  slug: string
): Promise<DetailInfo> {
  const sourceSlug = slug.startsWith('no-') ? `${type}-${slug}` : slug;
  const detailUrl = new URL(`/id/${sourceSlug}`, BASE_URL).toString();
  console.log(`Scraping detail: ${detailUrl}`);

  const html = await fetchHtml(detailUrl);
  const $ = cheerio.load(html);
  const fields = new Map<string, string>();

  $('table tr').each((_index, row) => {
    const key = normalizeText($(row).find('th').first().text()).toLowerCase();
    const value = normalizeText($(row).find('td').first().text());
    if (key) fields.set(key, value);
  });

  const number = fields.get('nomor');
  const year = Number(fields.get('tahun'));
  if (!number || !Number.isInteger(year)) {
    throw new Error(`Page structure changed; detail metadata was not found`);
  }

  const pdfHref = $('table a[href*="/files/"]').first().attr('href');

  return {
    title: normalizeText($('section#description h1').first().text()),
    type: fields.get('jenis/bentuk peraturan') ?? type.toUpperCase(),
    number,
    year,
    tentang: fields.get('tentang'),
    status: fields.get('status'),
    ditetapkan: {
      tempat: fields.get('tempat penetapan'),
      tanggal: fields.get('ditetapkan tanggal'),
      pejabat: fields.get('pejabat yang menetapkan'),
    },
    diundangkan: {
      tanggal: fields.get('tanggal pengundangan'),
      pejabat: fields.get('pejabat pengundangan'),
    },
    nomorLembaranNegara: fields.get('nomor pengundangan'),
    nomorTambahanLembaranNegara: fields.get('nomor tambahan'),
    pdfUrl: absoluteUrl(pdfHref),
    detailUrl,
  };
}

export async function scrapeAll(
  types: RegulationType[] = [...REGULATION_TYPES],
  maxPages = 1
): Promise<Regulation[]> {
  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new Error(`Invalid maximum page count: ${maxPages}`);
  }

  const allRegulations: Regulation[] = [];

  for (const type of types) {
    for (let page = 1; page <= maxPages; page++) {
      const regulations = await scrapeRegulationList(type, page);
      if (regulations.length === 0) break;

      allRegulations.push(...regulations);
      console.log(`[${type.toUpperCase()}] page ${page}: ${regulations.length}`);

      if (page < maxPages) {
        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }
    }
  }

  return allRegulations;
}

export async function saveToDatabase(regulations: Regulation[]) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to save scraped data');
  }

  const prisma = new PrismaClient();
  let saved = 0;

  try {
    for (const reg of regulations) {
      const sourceId = new URL(reg.detailUrl).pathname.replace(/^\/id\//, '');

      await prisma.legalDocument.upsert({
        where: {
          id: sourceId,
        },
        update: {
          title: reg.title,
          summary: reg.tentang,
          metadata: {
            nomor: reg.number,
            tahun: reg.year,
            tentang: reg.tentang,
            status: reg.status,
            pdfUrl: reg.pdfUrl,
          },
          sourceUrl: reg.detailUrl,
        },
        create: {
          id: sourceId,
          title: reg.title,
          type: reg.type,
          content: '',
          summary: reg.tentang,
          metadata: {
            nomor: reg.number,
            tahun: reg.year,
            tentang: reg.tentang,
            status: reg.status,
            pdfUrl: reg.pdfUrl,
          },
          sourceUrl: reg.detailUrl,
        },
      });
      saved++;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Saved ${saved} regulations`);
}

function parseType(value: string): RegulationType {
  if (!isRegulationType(value)) {
    throw new Error(
      `Unsupported regulation type "${value}". Use: ${REGULATION_TYPES.join(', ')}`
    );
  }
  return value;
}

async function main() {
  const command = process.argv[2] ?? 'scrape';
  const type = parseType(process.argv[3] ?? 'uu');

  if (command === 'detail') {
    const slug = process.argv[4];
    if (!slug) throw new Error('A detail slug is required');
    console.log(JSON.stringify(await scrapeRegulationDetail(type, slug), null, 2));
    return;
  }

  const pages = Number(process.argv[4] ?? '1');
  const data = await scrapeAll([type], pages);

  if (command === 'sync') {
    await saveToDatabase(data);
    return;
  }

  if (command !== 'scrape') {
    throw new Error(`Unknown command "${command}". Use: scrape, detail, or sync`);
  }

  console.log(JSON.stringify({
    count: data.length,
    sample: data.slice(0, 3),
  }, null, 2));
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
