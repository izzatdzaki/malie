/**
 * Legal Q&A prompt templates and utilities
 */

export const LEGAL_QA_SYSTEM_PROMPT = `Kamu adalah asisten hukum Indonesia yang profesional dan akurat.

Tugas kamu adalah menjawab pertanyaan hukum dari pengguna dengan:
1. Menggunakan konteks yang diberikan dari basisdata hukum Indonesia
2. Selalu cantumkan dasar hukum dan referensi (nomor UU/PP, tahun, tentang)
3. Berikan jawaban yang komprehensif tapi mudah dipahami
4. Jika informasi tidak cukup atau tidak yakin, jelaskan dengan jujur
5. Jawab dalam Bahasa Indonesia yang formal dan profesional

PERATURAN PENTING:
- Jangan membuat klaim yang tidak didukung oleh konteks
- Jika konteks tidak cukup, katakan bahwa informasi tambahan diperlukan
- Selalu ingatkan bahwa ini adalah informasi umum, bukan nasihat hukum profesional`;

export function buildLegalQAPrompt(question: string, context: {
  docs: Array<{ title: string; type: string; snippet: string }>;
  decisions: Array<{ title: string; type: string; snippet: string }>;
}): string {
  let prompt = `PERTANYAAN: ${question}\n\n`;

  if (context.docs.length > 0) {
    prompt += `DOKUMEN HUKUM YANG RELEVAN:\n`;
    context.docs.forEach((doc, i) => {
      prompt += `${i + 1}. [${doc.type.toUpperCase()}] ${doc.title}\n`;
      prompt += `   Excerpt: ${doc.snippet.slice(0, 500)}\n\n`;
    });
  }

  if (context.decisions.length > 0) {
    prompt += `PUTUSAN PENGADILAN YANG RELEVAN:\n`;
    context.decisions.forEach((dec, i) => {
      prompt += `${i + 1}. [${dec.type.toUpperCase()}] ${dec.title}\n`;
      prompt += `   Excerpt: ${dec.snippet.slice(0, 500)}\n\n`;
    });
  }

  prompt += `Berdasarkan konteks di atas, jawab pertanyaan dengan lengkap, akurat, dan disertai referensi hukum yang sesuai.`;

  return prompt;
}

export function formatLegalReference(doc: {
  id: string;
  type: string;
  title: string;
  snippet: string;
  sourceUrl?: string;
}): {
  type: 'uu' | 'pp' | 'putusan';
  id: string;
  title: string;
  snippet: string;
  sourceUrl?: string;
} {
  return {
    type: doc.type as 'uu' | 'pp' | 'putusan',
    id: doc.id,
    title: doc.title,
    snippet: doc.snippet.slice(0, 300),
    sourceUrl: doc.sourceUrl,
  };
}
