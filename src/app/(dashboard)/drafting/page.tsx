'use client';

import Link from 'next/link';
import { DOCUMENT_TEMPLATES } from '@/lib/ai/gemini';
import { cn } from '@/lib/utils';

export default function DraftingPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Buat Dokumen</h1>
        <p className="text-text-secondary mt-1">
          Pilih template dan buat dokumen hukum dalam hitungan menit
        </p>
      </div>

      {/* Templates grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOCUMENT_TEMPLATES.map((template) => (
              <Link
                key={template.id}
                href={`/drafting/${template.id}`}
                className="bg-surface border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{template.name}</h3>
                <p className="text-sm text-text-secondary">{template.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
