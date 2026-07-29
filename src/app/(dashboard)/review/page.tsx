'use client';

import { useState } from 'react';

type ReviewType = 'contract' | 'compliance' | 'due_diligence';

interface ReviewRisk {
  severity: 'low' | 'medium' | 'high';
  clause: string;
  recommendation: string;
}

interface ReviewResult {
  overallScore: number;
  summary: string;
  risks: ReviewRisk[];
}

const REVIEW_TYPES: Array<{
  value: ReviewType;
  label: string;
  desc: string;
}> = [
  { value: 'contract', label: 'Kontrak', desc: 'Risiko dalam kontrak' },
  { value: 'compliance', label: 'Compliance', desc: 'Kesesuaian UU' },
  { value: 'due_diligence', label: 'Due Diligence', desc: 'Analisis transaksi' },
];

export default function ReviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [reviewType, setReviewType] = useState<ReviewType>('contract');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Hanya file PDF dan DOCX yang diizinkan');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reviewType', reviewType);

      const res = await fetch('/api/review', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menganalisis dokumen');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Review Dokumen</h1>
        <p className="text-text-secondary mt-1">
          Upload dokumen untuk dianalisis risiko hukumnya
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {result ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-text-primary">Skor Keseluruhan</h2>
                  <span className={`text-2xl font-bold ${
                    result.overallScore >= 70 ? 'text-accent' :
                    result.overallScore >= 40 ? 'text-warning' : 'text-danger'
                  }`}>
                    {result.overallScore}/100
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      result.overallScore >= 70 ? 'bg-accent' :
                      result.overallScore >= 40 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${result.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="font-semibold text-text-primary mb-3">Ringkasan</h2>
                <p className="text-text-secondary">{result.summary}</p>
              </div>

              {/* Risks */}
              {result.risks && result.risks.length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="font-semibold text-text-primary mb-4">Risiko Terdeteksi</h2>
                  <div className="space-y-3">
                    {result.risks.map((risk, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            risk.severity === 'high' ? 'bg-red-100 text-danger' :
                            risk.severity === 'medium' ? 'bg-yellow-100 text-warning' :
                            'bg-green-100 text-accent'
                          }`}>
                            {risk.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-text-primary font-medium mb-1">{risk.clause}</p>
                        <p className="text-sm text-text-secondary">{risk.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setResult(null)}
                className="w-full bg-muted text-text-primary py-2 rounded-lg font-medium hover:bg-border transition"
              >
                Upload Dokumen Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-danger text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Review Type */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Jenis Review
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {REVIEW_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setReviewType(type.value)}
                      className={`p-3 border rounded-lg text-left transition ${
                        reviewType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <p className="font-medium text-text-primary">{type.label}</p>
                      <p className="text-xs text-text-secondary">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Upload Dokumen
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {file ? (
                      <div>
                        <p className="font-medium text-text-primary">{file.name}</p>
                        <p className="text-sm text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 text-text-secondary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-text-primary font-medium">Klik untuk upload</p>
                        <p className="text-sm text-text-secondary">PDF atau DOCX (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
              >
                {isLoading ? 'Menganalisis...' : 'Analisis Dokumen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
