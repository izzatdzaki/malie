/**
 * Document generation prompt templates
 */

import { DocumentTemplate, DOCUMENT_TEMPLATES } from './gemini';

export function buildDocumentGenerationPrompt(
  templateId: string,
  fields: Record<string, string>
): string {
  const template = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  let prompt = `Buatkan dokumen hukum "${template.name}" dengan detail berikut:\n\n`;

  // Add field values
  for (const [key, value] of Object.entries(fields)) {
    const field = template.fields.find((f) => f.name === key);
    const label = field?.label || key;
    prompt += `**${label}**: ${value}\n`;
  }

  prompt += `\nPERSYARATAN DOKUMEN:\n`;
  prompt += `- Gunakan format dokumen hukum Indonesia yang formal dan lengkap\n`;
  prompt += `- Sertakan judul dokumen yang jelas\n`;
  prompt += `-Cantumkan bagian-bagian yang relevan (mengenai, para pihak, isi perjanjian, dll)\n`;
  prompt += `- Gunakan bahasa hukum formal Indonesia (Baku)\n`;
  prompt += `- Sertakan klausul standar yang sesuai\n`;
  prompt += `- Akhiri dengan bagian tanda tangan\n`;
  prompt += `- TIDAK perlu mengisi nomor dokumen atau tanggal (biarkan kosong untuk sementara)\n\n`;
  prompt += `HANYA berikan isi dokumen tanpa komentar atau penjelasan tambahan.`;

  return prompt;
}

export function buildContractReviewPrompt(
  documentText: string,
  reviewType: 'contract' | 'compliance' | 'due_diligence'
): { system: string; user: string } {
  const prompts = {
    contract: {
      system: `Kamu adalah pengacara kontrak yang berpengalaman di Indonesia.
Analisis dokumen kontrak ini dan berikan:
1. RINGKASAN: Overview umum isi kontrak (1-2 paragraf)
2. RISIKO: Daftar risiko hukum utama yang ditemukan (jika ada)
3. KLAUSUL BERMASALAH: Klausul-klausul yang perlu perhatian khusus
4. SARAN: Rekomendasi perbaikan atau hal yang perlu dinegosiasikan

Berikan jawaban dalam format JSON dengan field:
- summary (string)
- risks (array dengan objects: severity, clause, recommendation)
- overallScore (0-100)`,
      user: `ANALISIS KONTRAK\n\nDokumen:\n${documentText}`,
    },
    compliance: {
      system: `Kamu adalah konsultan compliance di Indonesia.
Analisis dokumen ini dan identifikasi:
1. Kesesuaian dengan UU dan PP yang berlaku di Indonesia
2. Potensi pelanggaran atau ketidakpatuhan
3. Rekomendasi untuk mencapai compliance

Berikan jawaban dalam format JSON dengan field:
- summary (string)
- risks (array dengan objects: severity, clause, recommendation)
- overallScore (0-100)`,
      user: `ANALISIS COMPLIANCE\n\nDokumen:\n${documentText}`,
    },
    due_diligence: {
      system: `Kamu adalah tim legal due diligence yang berpengalaman.
Analisis dokumen ini dan berikan:
1. RINGKASAN: Kondisi hukum secara umum
2. RISIKO: Risiko dan liabilitas yang teridentifikasi
3. TEMUAN: Hal-hal yang perlu perhatian khusus
4. REKOMENDASI: Saran untuk transaksi atau keputusan

Berikan jawaban dalam format JSON dengan field:
- summary (string)
- risks (array dengan objects: severity, clause, recommendation)
- overallScore (0-100)`,
      user: `ANALISIS DUE DILIGENCE\n\nDokumen:\n${documentText}`,
    },
  };

  return prompts[reviewType];
}
