import { NextRequest, NextResponse } from 'next/server';
import { generateDocument } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const { templateId, fields } = await req.json();

    if (!templateId || !fields) {
      return NextResponse.json(
        { error: 'Template ID and fields are required' },
        { status: 400 }
      );
    }

    const content = await generateDocument(templateId, fields);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}
