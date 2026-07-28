import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface LegalReference {
  type: 'uu' | 'pp' | 'putusan';
  id: string;
  title: string;
  snippet: string;
  sourceUrl?: string;
}

export interface ChatResponse {
  content: string;
  references: LegalReference[];
}

export async function getLegalAnswer(
  question: string,
  context: { docs: LegalReference[]; decisions: LegalReference[] }
): Promise<ChatResponse> {
  const contextText = buildContextText(context);

  const systemPrompt = `Kamu adalah asisten hukum Indonesia yang profesional dan akurat.
Gunakan konteks yang diberikan untuk menjawab pertanyaan pengguna.
Selalu cantumkan dasar hukum dan referensi yang digunakan (nomor UU/PP, tahun, tentang).
Jika informasi tidak cukup atau tidak yakin, jelaskan dengan jujur.
Jawab dalam Bahasa Indonesia yang formal dan mudah dipahami.`;

  const userPrompt = `Pertanyaan: ${question}

${contextText}

Berdasarkan konteks di atas, jawab pertanyaan tersebut dengan lengkap dan akurat.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return {
    content: content.text,
    references: context.docs.concat(context.decisions),
  };
}

function buildContextText(context: { docs: LegalReference[]; decisions: LegalReference[] }): string {
  let text = '';

  if (context.docs.length > 0) {
    text += 'DOKUMEN HUKUM YANG RELEVAN:\n';
    context.docs.forEach((doc, i) => {
      text += `${i + 1}. ${doc.title}\n   Snippet: ${truncate(doc.snippet, 300)}\n`;
    });
    text += '\n';
  }

  if (context.decisions.length > 0) {
    text += 'PUTUSAN PENGADILAN YANG RELEVAN:\n';
    context.decisions.forEach((dec, i) => {
      text += `${i + 1}. ${dec.title}\n   Snippet: ${truncate(dec.snippet, 300)}\n`;
    });
  }

  return text;
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export async function reviewDocument(
  documentText: string,
  reviewType: 'contract' | 'compliance' | 'due_diligence'
): Promise<{
  summary: string;
  risks: Array<{ severity: 'low' | 'medium' | 'high'; clause: string; recommendation: string }>;
  overallScore: number;
}> {
  const reviewPrompts = {
    contract: `Kamu adalah pengacara kontrak yang berpengalaman. Analisis dokumen kontrak ini dan identifikasi:
1. Risiko hukum utama
2. Klausul-klausul yang perlu diperhatikan
3. Rekomendasi perbaikan`,
    compliance: `Kamu adalah konsultan compliance. Analisis dokumen ini dan identifikasi:
1. Kesesuaian dengan UU/PP yang berlaku
2. Potensi pelanggaran
3. Rekomendasi compliance`,
    due_diligence: `Kamu adalah tim legal due diligence. Analisis dokumen ini dan berikan:
1. Ringkasan kondisi hukum
2. Risiko dan liabilitas
3. Rekomendasi untuk transaksi`,
  };

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `Kamu adalah asisten review dokumen hukum yang detail dan akurat. Berikan analisis dalam format JSON dengan field: summary (string), risks (array dengan severity, clause, recommendation), dan overallScore (0-100).`,
    messages: [
      {
        role: 'user',
        content: `${reviewPrompts[reviewType]}

DOKUMEN:
${documentText}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(content.text);
    return parsed;
  } catch {
    // Fallback if JSON parsing fails
    return {
      summary: content.text,
      risks: [],
      overallScore: 50,
    };
  }
}
