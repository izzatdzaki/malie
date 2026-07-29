'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  RefreshCw,
} from 'lucide-react';

type DocumentFilter = 'all' | 'uu' | 'pp' | 'perpres' | 'permen' | 'perda';
type DataSource = 'peraturan-go-id' | 'bpk';

interface Regulation {
  title: string;
  type: string;
  number: string;
  year: number | null;
  tentang: string;
  source?: 'bpk';
  status?: string;
  subjects?: string[];
  abstract?: string;
  pdfUrl?: string;
  downloads?: Array<{ name: string; url: string }>;
  detailUrl: string;
}

interface RegulationsResponse {
  regulations?: Regulation[];
  hasNext?: boolean;
  pageNumbers?: number[];
  totalItems?: number;
  totalPages?: number;
  error?: string;
}

const SOURCES: Array<{ value: DataSource; label: string }> = [
  { value: 'peraturan-go-id', label: 'Peraturan.go.id' },
  { value: 'bpk', label: 'JDIH BPK' },
];

const FILTERS: Array<{ value: DocumentFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'uu', label: 'UU' },
  { value: 'pp', label: 'PP' },
  { value: 'perpres', label: 'Perpres' },
  { value: 'permen', label: 'Permen' },
  { value: 'perda', label: 'Perda' },
];

const BPK_YEARS = Array.from(
  { length: new Date().getFullYear() - 1944 },
  (_value, index) => new Date().getFullYear() - index
);

export default function AdminDocumentsPage() {
  const [source, setSource] = useState<DataSource>('peraturan-go-id');
  const [filter, setFilter] = useState<DocumentFilter>('all');
  const [documents, setDocuments] = useState<Regulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [pageNumbers, setPageNumbers] = useState([1]);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [bpkYear, setBpkYear] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const endpoint = source === 'bpk'
      ? `/api/bpk-regulations?page=${page}${
          bpkYear ? `&year=${bpkYear}` : ''
        }`
      : `/api/regulations?type=${filter}&page=${page}`;

    fetch(endpoint, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        const data = await response.json() as RegulationsResponse;
        if (!response.ok) {
          throw new Error(data.error ?? 'Gagal mengambil dokumen');
        }
        return {
          regulations: data.regulations ?? [],
          hasNext: data.hasNext ?? false,
          pageNumbers: data.pageNumbers ?? [page],
          totalItems: data.totalItems ?? null,
          totalPages: data.totalPages ?? null,
        };
      })
      .then((result) => {
        setDocuments(result.regulations);
        setHasNext(result.hasNext);
        setPageNumbers(result.pageNumbers);
        setTotalItems(result.totalItems);
        setTotalPages(result.totalPages);
        setIsLoading(false);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return;
        }
        setDocuments([]);
        setHasNext(false);
        setPageNumbers([page]);
        setTotalItems(null);
        setTotalPages(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Gagal mengambil dokumen'
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [bpkYear, filter, page, refreshKey, source]);

  const refreshDocuments = () => {
    setIsLoading(true);
    setError('');
    setRefreshKey((key) => key + 1);
  };

  const selectFilter = (value: DocumentFilter) => {
    if (value === filter && page === 1) return;
    setIsLoading(true);
    setError('');
    setPage(1);
    setFilter(value);
  };

  const selectSource = (value: DataSource) => {
    if (value === source) return;
    setIsLoading(true);
    setError('');
    setPage(1);
    setFilter('all');
    setSource(value);
  };

  const selectPage = (value: number) => {
    setIsLoading(true);
    setError('');
    setPage(value);
  };

  const selectBpkYear = (value: string) => {
    setIsLoading(true);
    setError('');
    setPage(1);
    setBpkYear(value);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Manajemen Dokumen
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {isLoading
              ? 'Memuat data peraturan...'
              : totalItems
                ? `${documents.length} dari ${totalItems.toLocaleString('id-ID')} dokumen JDIH BPK, halaman ${page}`
                : `${documents.length} dokumen dari peraturan.go.id, halaman ${page}`}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshDocuments}
          disabled={isLoading}
          title="Muat ulang data"
          aria-label="Muat ulang data"
          className="w-10 h-10 inline-flex items-center justify-center border border-border bg-surface text-text-secondary rounded-lg hover:text-primary hover:border-primary disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div
        className="flex gap-1 pb-4 mb-4 border-b border-border"
        role="tablist"
        aria-label="Sumber data"
      >
        {SOURCES.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={source === item.value}
            onClick={() => selectSource(item.value)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              source === item.value
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-muted hover:text-text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {source === 'peraturan-go-id' && (
      <div
        className="flex gap-1 mb-5 overflow-x-auto"
        role="tablist"
        aria-label="Jenis peraturan"
      >
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => selectFilter(item.value)}
            className={`shrink-0 px-3 py-2 rounded-md text-sm font-medium transition ${
              filter === item.value
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-muted hover:text-text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      )}

      {source === 'bpk' && (
        <div className="mb-5">
          <label
            htmlFor="bpk-year"
            className="block text-xs font-semibold text-text-secondary uppercase mb-2"
          >
            Tahun
          </label>
          <select
            id="bpk-year"
            value={bpkYear}
            onChange={(event) => selectBpkYear(event.target.value)}
            className="w-full max-w-56 h-10 px-3 border border-border bg-surface text-sm text-text-primary rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">Semua tahun</option>
            {BPK_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="border border-border bg-surface rounded-lg overflow-hidden">
        {error ? (
          <div className="min-h-64 flex flex-col items-center justify-center p-6 text-center">
            <p className="font-medium text-danger">{error}</p>
            <button
              type="button"
              onClick={refreshDocuments}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-600 transition"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">
                    Dokumen
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase w-44">
                    Jenis
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase w-24">
                    Tahun
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase w-28">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-4">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 mt-2 animate-pulse" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-5 bg-muted rounded w-14 animate-pulse" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-muted rounded w-10 animate-pulse" />
                      </td>
                      <td className="px-4 py-4" />
                    </tr>
                  ))
                ) : documents.length > 0 ? (
                  documents.map((document) => (
                    <tr
                      key={document.detailUrl}
                      className="border-t border-border hover:bg-muted/50 transition"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary">
                          {document.tentang}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {document.title}
                        </p>
                        {document.status && (
                          <p className="text-xs text-accent mt-1">
                            {document.status}
                          </p>
                        )}
                        {document.subjects && document.subjects.length > 0 && (
                          <p className="text-xs text-text-secondary mt-1">
                            {document.subjects.join(' / ')}
                          </p>
                        )}
                        {document.abstract && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-medium text-secondary">
                              Abstrak
                            </summary>
                            <p className="mt-2 max-w-4xl text-sm leading-6 text-text-secondary whitespace-pre-wrap">
                              {document.abstract}
                            </p>
                            {document.downloads && document.downloads.length > 1 && (
                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                                {document.downloads.map((download) => (
                                  <a
                                    key={download.url}
                                    href={download.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-secondary hover:underline"
                                  >
                                    {download.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </details>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          title={document.type}
                          className="inline-flex max-w-40 px-2 py-1 rounded bg-primary-50 text-primary text-xs leading-4 font-semibold uppercase line-clamp-2"
                        >
                          {document.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {document.year ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {document.pdfUrl && (
                            <a
                              href={document.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Buka PDF"
                              aria-label={`Buka PDF ${document.title}`}
                              className="w-9 h-9 inline-flex items-center justify-center text-text-secondary rounded-md hover:bg-muted hover:text-primary transition"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          <a
                            href={document.detailUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Buka sumber"
                            aria-label={`Buka sumber ${document.title}`}
                            className="w-9 h-9 inline-flex items-center justify-center text-text-secondary rounded-md hover:bg-muted hover:text-primary transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-16 text-center text-text-secondary"
                    >
                      Tidak ada dokumen pada kategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!error && (
        <nav
          className="flex items-center justify-between gap-3 mt-4"
          aria-label="Navigasi halaman dokumen"
        >
          <p className="shrink-0 text-sm text-text-secondary">
            Halaman {page}
          </p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => selectPage(page - 1)}
              disabled={page === 1 || isLoading}
              title="Halaman sebelumnya"
              aria-label="Halaman sebelumnya"
              className="w-9 h-9 inline-flex items-center justify-center border border-border bg-surface text-text-secondary rounded-md hover:border-primary hover:text-primary disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {!pageNumbers.includes(1) && (
              <>
                <button
                  type="button"
                  onClick={() => selectPage(1)}
                  disabled={isLoading}
                  aria-label="Halaman 1"
                  className="w-9 h-9 shrink-0 inline-flex items-center justify-center border border-border bg-surface text-sm text-text-secondary rounded-md hover:border-primary hover:text-primary disabled:opacity-40 transition"
                >
                  1
                </button>
                <span className="w-7 text-center text-text-secondary">...</span>
              </>
            )}
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => selectPage(pageNumber)}
                disabled={isLoading || pageNumber === page}
                aria-current={pageNumber === page ? 'page' : undefined}
                aria-label={`Halaman ${pageNumber}`}
                className={`w-9 h-9 shrink-0 inline-flex items-center justify-center border text-sm rounded-md transition ${
                  pageNumber === page
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            {totalPages && !pageNumbers.includes(totalPages) && (
              <>
                <span className="w-7 shrink-0 text-center text-text-secondary">
                  ...
                </span>
                <button
                  type="button"
                  onClick={() => selectPage(totalPages)}
                  disabled={isLoading}
                  aria-label={`Halaman ${totalPages}`}
                  className="min-w-9 h-9 px-2 shrink-0 inline-flex items-center justify-center border border-border bg-surface text-sm text-text-secondary rounded-md hover:border-primary hover:text-primary disabled:opacity-40 transition"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => selectPage(page + 1)}
              disabled={!hasNext || isLoading}
              title="Halaman berikutnya"
              aria-label="Halaman berikutnya"
              className="w-9 h-9 inline-flex items-center justify-center border border-border bg-surface text-text-secondary rounded-md hover:border-primary hover:text-primary disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
