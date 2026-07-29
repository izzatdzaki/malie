import { NextRequest, NextResponse } from 'next/server';
import { getLegalAnswer } from '@/lib/ai/claude';
import { searchAll } from '@/lib/vector/search';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Search for relevant context
    const searchResults = await searchAll(message, 5);

    // Get answer from Claude
    const answer = await getLegalAnswer(message, {
      docs: searchResults.docs.map((d) => ({
        id: d.id,
        type: d.type,
        title: d.title,
        snippet: d.snippet,
        sourceUrl: d.sourceUrl,
      })),
      decisions: searchResults.decisions.map((d) => ({
        id: d.id,
        type: d.type,
        title: d.title,
        snippet: d.snippet,
        sourceUrl: d.sourceUrl,
      })),
    });

    return NextResponse.json({
      content: answer.content,
      references: answer.references,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}
