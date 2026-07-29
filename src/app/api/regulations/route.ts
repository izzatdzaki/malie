import { NextRequest, NextResponse } from 'next/server';
import {
  REGULATION_TYPES,
  isRegulationType,
  scrapeRegulationPage,
  type Regulation,
} from '@/scripts/scrapers/peraturan-go-id';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'all';
  const page = Number(req.nextUrl.searchParams.get('page') ?? '1');

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json(
      { error: 'Nomor halaman tidak valid' },
      { status: 400 }
    );
  }

  try {
    let regulations: Regulation[] | null;
    let hasNext: boolean;
    let pageNumbers: number[];

    if (type === 'all') {
      const pages = await Promise.all(
        REGULATION_TYPES.map((item) => scrapeRegulationPage(item, page))
      );
      regulations = pages.flatMap((result) => result.regulations);
      hasNext = pages.some((result) => result.hasNext);
      pageNumbers = [
        ...new Set(pages.flatMap((result) => result.pageNumbers)),
      ].sort((a, b) => a - b);
    } else if (isRegulationType(type)) {
      const result = await scrapeRegulationPage(type, page);
      regulations = result.regulations;
      hasNext = result.hasNext;
      pageNumbers = result.pageNumbers;
    } else {
      regulations = null;
      hasNext = false;
      pageNumbers = [];
    }

    if (!regulations) {
      return NextResponse.json(
        { error: 'Jenis peraturan tidak didukung' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        count: regulations.length,
        page,
        hasNext,
        pageNumbers,
        regulations,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Regulation scraping error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data dari peraturan.go.id' },
      { status: 502 }
    );
  }
}
