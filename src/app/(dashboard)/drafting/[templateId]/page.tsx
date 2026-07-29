'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DOCUMENT_TEMPLATES } from '@/lib/ai/gemini';

export default function TemplateFormPage() {
  const params = useParams();
  const templateId = params.templateId as string;
  const template = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!template) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/drafting" className="text-secondary hover:underline mb-2 inline-block">
            &larr; Kembali
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Template tidak ditemukan</h1>
        </div>
      </div>
    );
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, fields: formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan dokumen');
      }

      setGeneratedContent(data.content);
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
        <Link href="/drafting" className="text-secondary hover:underline mb-2 inline-block">
          &larr; Kembali
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">{template.name}</h1>
        <p className="text-text-secondary mt-1">{template.description}</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6">
          {generatedContent ? (
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="font-semibold text-text-primary mb-4">Dokumen Hasil Generate</h2>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-text-primary font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {generatedContent}
                  </pre>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setGeneratedContent(null)}
                  className="flex-1 bg-muted text-text-primary py-2 rounded-lg font-medium hover:bg-border transition"
                >
                  Buat Baru
                </button>
                <button className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition">
                  Download DOCX
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-danger text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              {template.fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-text-primary mb-1">
                    {field.label}
                    {field.required && <span className="text-danger ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
              >
                {isLoading ? 'Memuat...' : 'Generate Dokumen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
