'use client';

import { cn } from '@/lib/utils';
import { LegalReference } from '@/lib/ai/claude';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  references?: LegalReference[];
}

export function Message({ role, content, references }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-muted text-text-primary rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>

        {!isUser && references && references.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-text-secondary mb-2">Referensi:</p>
            <div className="space-y-2">
              {references.slice(0, 5).map((ref, index) => (
                <div
                  key={index}
                  className="bg-surface/50 rounded-lg p-2 text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded',
                        ref.type === 'uu'
                          ? 'bg-blue-100 text-blue-700'
                          : ref.type === 'pp'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      )}
                    >
                      {ref.type.toUpperCase()}
                    </span>
                    <span className="font-medium text-text-primary text-xs">
                      {ref.title}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {ref.snippet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p
          className={cn(
            'text-xs mt-2',
            isUser ? 'text-white/60' : 'text-text-secondary'
          )}
        >
          {isUser ? 'Anda' : 'LegalAI'}
        </p>
      </div>
    </div>
  );
}
