'use client';

import { useState, useRef, useEffect } from 'react';
import type { LegalReference } from '@/lib/ai/claude';
import { Message } from './message';

interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: LegalReference[];
}

interface ChatContainerProps {
  messages: MessageData[];
  isLoading?: boolean;
  onSendMessage: (message: string) => void;
}

export function ChatContainer({
  messages,
  isLoading,
  onSendMessage,
}: ChatContainerProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Mulai Percakapan
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Ketik pertanyaan hukum Anda di bawah ini. AI akan mencari
                referensi dari UU, PP, dan putusan pengadilan yang relevan.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              references={message.references}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border bg-surface">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: Apa saja syarat sahnya sebuah kontrak menurut BW?"
              className="w-full px-4 py-3 pr-12 border border-border rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              rows={2}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition"
            >
              {isLoading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
          <p className="text-xs text-text-secondary mt-2 text-center">
            Jawaban AI bersifat informatif dan tidak menggantikan nasihat hukum
            profesional
          </p>
        </div>
      </div>
    </div>
  );
}
