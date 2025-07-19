import { NextRequest, NextResponse } from 'next/server';
import { generateQueenElizabethClickhole } from '@/lib/generator';
import { getAllReferences, pickRelevantReferences } from '@/lib/referencePicker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, tone = 'absurd' } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'User input is required and must be a string' },
        { status: 400 }
      );
    }

    if (userInput.length > 2000) {
      return NextResponse.json(
        { error: 'Input text is too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Get all reference articles
    const allReferences = await getAllReferences();
    
    if (allReferences.length === 0) {
      return NextResponse.json(
        { error: 'No reference articles found' },
        { status: 500 }
      );
    }

    // Pick relevant references based on user input
    const relevantReferences = pickRelevantReferences(userInput, allReferences, 2);

    // Generate the article
    const generatedArticle = await generateQueenElizabethClickhole({
      userInput,
      references: relevantReferences,
      tone
    });

    return NextResponse.json({
      success: true,
      article: generatedArticle,
      usedReferences: relevantReferences.map(ref => ({
        title: ref.title,
        filename: ref.filename
      }))
    });

  } catch (error) {
    console.error('Generation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'API is running',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    referencesCount: (await getAllReferences()).length
  });
} 