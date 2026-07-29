import { NextRequest, NextResponse } from 'next/server';
import { scrapeBpkRegulationPage } from '@/scripts/scrapers/bpk-go-id';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get('page') ?? '1');
  const yearParam = req.nextUrl.searchParams.get('year');
  const year = yearParam ? Number(yearParam) : undefined;

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    (year !== undefined && (!Number.isInteger(year) || year < 1945))
  ) {
    return NextResponse.json(
      { error: 'Nomor halaman tidak valid' },
      { status: 400 }
    );
  }

  try {
    const result = await scrapeBpkRegulationPage(page, year);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('BPK regulation scraping error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data dari peraturan.bpk.go.id' },
      { status: 502 }
    );
  }
}
