'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DocumentTemplate } from '@/lib/ai/gemini';

interface TemplateSelectorProps {
  templates: DocumentTemplate[];
  selectedId?: string;
}

export function TemplateSelector({
  templates,
  selectedId,
}: TemplateSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => {
        const isSelected = selectedId === template.id;

        return (
          <Link
            key={template.id}
            href={`/drafting/${template.id}`}
            className={cn(
              'bg-surface border rounded-xl p-6 transition group',
              isSelected
                ? 'border-primary shadow-md'
                : 'border-border hover:border-primary hover:shadow-md'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition',
                isSelected
                  ? 'bg-primary/20'
                  : 'bg-primary/10 group-hover:bg-primary/20'
              )}
            >
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">
              {template.name}
            </h3>
            <p className="text-sm text-text-secondary">{template.description}</p>
            <p className="text-xs text-text-secondary mt-3">
              {template.fields.length} field
            </p>
          </Link>
        );
      })}
    </div>
  );
}
