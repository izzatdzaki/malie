'use client';

interface DocumentPreviewProps {
  content: string;
  title?: string;
}

export function DocumentPreview({ content, title }: DocumentPreviewProps) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">
            {title || 'Preview Dokumen'}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Dokumen hasil generate
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-border transition">
            Copy
          </button>
          <button className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-600 transition">
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <pre className="whitespace-pre-wrap text-sm text-text-primary font-mono bg-muted p-4 rounded-lg overflow-auto max-h-[500px]">
          {content}
        </pre>
      </div>
    </div>
  );
}
