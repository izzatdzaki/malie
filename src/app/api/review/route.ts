import { NextRequest, NextResponse } from 'next/server';
import { reviewDocument } from '@/lib/ai/claude';
import { extractTextFromFile } from '@/lib/document-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const reviewType = formData.get('reviewType') as 'contract' | 'compliance' | 'due_diligence';

    if (!file || !reviewType) {
      return NextResponse.json(
        { error: 'File and review type are required' },
        { status: 400 }
      );
    }

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const documentText = await extractTextFromFile(buffer, file.type.split('/')[1]);

    // Get review from Claude
    const result = await reviewDocument(documentText, reviewType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json(
      { error: 'Failed to review document' },
      { status: 500 }
    );
  }
}
