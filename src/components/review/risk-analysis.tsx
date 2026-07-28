'use client';

import { cn } from '@/lib/utils';

interface Risk {
  severity: 'low' | 'medium' | 'high';
  clause: string;
  recommendation: string;
}

interface RiskAnalysisProps {
  risks: Risk[];
  overallScore: number;
  summary: string;
}

export function RiskAnalysis({ risks, overallScore, summary }: RiskAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Skor Keseluruhan</h2>
          <span
            className={cn(
              'text-2xl font-bold',
              overallScore >= 70
                ? 'text-accent'
                : overallScore >= 40
                ? 'text-warning'
                : 'text-danger'
            )}
          >
            {overallScore}/100
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={cn(
              'h-3 rounded-full transition-all',
              overallScore >= 70
                ? 'bg-accent'
                : overallScore >= 40
                ? 'bg-warning'
                : 'bg-danger'
            )}
            style={{ width: `${overallScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-secondary">
          <span>Rendah</span>
          <span>Sedang</span>
          <span>Tinggi</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text-primary mb-3">Ringkasan</h2>
        <p className="text-text-secondary">{summary}</p>
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-primary mb-4">
            Risiko Terdeteksi ({risks.length})
          </h2>
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div
                key={index}
                className={cn(
                  'border rounded-lg p-4',
                  risk.severity === 'high'
                    ? 'border-red-200 bg-red-50'
                    : risk.severity === 'medium'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-green-200 bg-green-50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      risk.severity === 'high'
                        ? 'bg-red-100 text-danger'
                        : risk.severity === 'medium'
                        ? 'bg-yellow-100 text-warning'
                        : 'bg-green-100 text-accent'
                    )}
                  >
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
    </div>
  );
}
