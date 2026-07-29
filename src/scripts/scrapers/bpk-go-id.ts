/**
 * Reference scraper for the public JDIH BPK regulation catalog.
 *
 * Usage: npm run scrape:bpk -- 1
 */

import { pathToFileURL } from 'node:url';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://peraturan.bpk.go.id';
const REQUEST_HEADERS = {
  accept: 'text/html,application/xhtml+xml',
  'user-agent': 'LegalAI reference index/1.0',
};

export interface BpkDownload {
  name: string;
  url: string;
}

export interface BpkRegulation {
  source: 'bpk';
  sourceId: string;
  title: string;
  type: string;
  number: string;
  year: number | null;
  tentang: string;
  status?: string;
  subjects: string[];
  abstract?: string;
  pdfUrl?: string;
  downloads: BpkDownload[];
  detailUrl: string;
}

export interface BpkRegulationPage {
  regulations: BpkRegulation[];
  page: number;
  pageNumbers: number[];
  hasNext: boolean;
  totalItems: number;
  totalPages: number;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function absoluteUrl(value?: string): string | undefined {
  return value ? new URL(value, BASE_URL).toString() : undefined;
}

function parseLastPage(
  $: cheerio.CheerioAPI,
  currentPage: number
): number {
  const href = $('.pagination a')
    .filter((_index, element) => normalizeText($(element).text()) === 'Last')
    .first()
    .attr('href');

  if (!href) return currentPage;
  const page = Number(new URL(href, BASE_URL).searchParams.get('p'));
  return Number.isInteger(page) && page > 0 ? page : currentPage;
}

export async function scrapeBpkRegulationPage(
  page = 1,
  year?: number
): Promise<BpkRegulationPage> {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Invalid BPK page number: ${page}`);
  }

  const url = new URL('/Search', BASE_URL);
  url.searchParams.set('p', String(page));
  if (year) url.searchParams.set('tahun', String(year));
  console.log(`Scraping BPK page ${page}: ${url}`);

  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  const $ = cheerio.load(await response.text());
  const regulations: BpkRegulation[] = [];

  $('.row.mb-8 > .col-12 > .card').each((_index, element) => {
    const card = $(element);
    const detailLink = card
      .find('.col-lg-10.fs-2.fw-bold a[href*="/Details/"]')
      .first();
    const detailHref = detailLink.attr('href');
    const sourceId = detailHref?.match(/\/Details\/(\d+)/)?.[1];

    if (!detailHref || !sourceId) return;

    const descriptor = normalizeText(
      card
        .find('.row.g-4.g-xl-9.mb-4')
        .first()
        .find('.col-lg-8')
        .text()
    );
    const type = normalizeText(
      descriptor.split(/\s+(?:Nomor|Tahun)\s+/i)[0]
    );
    const number = descriptor.match(/Nomor\s+(.+?)(?:\s+Tahun|$)/i)?.[1] ?? '-';
    const parsedYear = Number(descriptor.match(/Tahun\s+(\d{4})/i)?.[1]);
    const downloads = card
      .find('a.download-file[href]')
      .map((_downloadIndex, download) => ({
        name: normalizeText($(download).text()),
        url: absoluteUrl($(download).attr('href')) as string,
      }))
      .get();
    const abstract = normalizeText(
      $(`#abstrak-${sourceId} .modal-body .fs-5`).first().text()
    );

    regulations.push({
      source: 'bpk',
      sourceId,
      title: descriptor,
      type,
      number,
      year: Number.isInteger(parsedYear) ? parsedYear : null,
      tentang: normalizeText(detailLink.text()),
      status: normalizeText(card.find('.text-muted').first().text())
        .replace(/^•\s*/, '') || undefined,
      subjects: card
        .find('.badge')
        .map((_subjectIndex, subject) => normalizeText($(subject).text()))
        .get()
        .filter(Boolean),
      abstract: abstract || undefined,
      pdfUrl: downloads[0]?.url,
      downloads,
      detailUrl: absoluteUrl(detailHref) as string,
    });
  });

  const bodyText = normalizeText($('body').text());
  const totalItemsText = bodyText.match(
    /Menemukan\s+([\d.]+)\s+peraturan/i
  )?.[1];
  const totalItems = Number(totalItemsText?.replace(/\./g, '') ?? 0);
  const advertisedTotalPages = parseLastPage($, page);
  const totalPages = year
    ? advertisedTotalPages
    : Math.min(advertisedTotalPages, 30_000);
  const pageNumbers = [
    ...new Set(
      $('.pagination a')
        .map((_index, element) => Number(normalizeText($(element).text())))
        .get()
        .filter((value) => Number.isInteger(value) && value > 0)
    ),
  ].sort((a, b) => a - b);

  if (regulations.length === 0 && page <= totalPages) {
    throw new Error('BPK page structure changed; no records could be parsed');
  }

  return {
    regulations,
    page,
    pageNumbers,
    hasNext: page < totalPages,
    totalItems,
    totalPages,
  };
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const page = Number(process.argv[2] ?? '1');
  const year = process.argv[3] ? Number(process.argv[3]) : undefined;
  scrapeBpkRegulationPage(page, year)
    .then((result) => {
      console.log(JSON.stringify({
        page: result.page,
        count: result.regulations.length,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        sample: result.regulations.slice(0, 3),
      }, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
