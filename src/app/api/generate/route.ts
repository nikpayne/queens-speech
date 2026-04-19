import { NextRequest, NextResponse } from 'next/server';
import { generateQueenElizabethClickhole, type GenerationMode } from '@/lib/generator';
import { getAllReferences, pickRandomReferences } from '@/lib/referencePicker';
import {
  DEFAULT_MODEL_TIER,
  DEFAULT_SAMPLE_COUNT,
  MAX_SAMPLE_COUNT,
  type ModelTier,
} from '@/lib/generationConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userInput,
      mode = "write",
      sampleCount = DEFAULT_SAMPLE_COUNT,
      modelTier = DEFAULT_MODEL_TIER,
    } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'User input is required and must be a string' },
        { status: 400 }
      );
    }

      if (mode && !['write', 'rewrite'].includes(mode)) {
    return NextResponse.json(
      { error: 'Mode must be either "write" or "rewrite"' },
        { status: 400 }
      );
    }

    if (userInput.length > 2000) {
      return NextResponse.json(
        { error: 'Input text is too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    if (
      typeof sampleCount !== 'number' ||
      !Number.isInteger(sampleCount) ||
      sampleCount < 1 ||
      sampleCount > MAX_SAMPLE_COUNT
    ) {
      return NextResponse.json(
        { error: `sampleCount must be an integer between 1 and ${MAX_SAMPLE_COUNT}` },
        { status: 400 }
      );
    }

    if (modelTier !== 'cheap' && modelTier !== 'fancy') {
      return NextResponse.json(
        { error: 'modelTier must be "cheap" or "fancy"' },
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

    // Pick random references for few-shot examples.
    const relevantReferences = pickRandomReferences(allReferences, sampleCount);

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            usedReferences: relevantReferences.map(ref => ({
              title: ref.title,
              filename: ref.filename
            }))
          };
          console.log('Sending metadata:', metadata);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // Generate the article with streaming
          await generateQueenElizabethClickhole({
            userInput,
            mode: mode as GenerationMode,
            references: relevantReferences,
            modelTier: modelTier as ModelTier,
            onPrompt: (prompt: string) => {
              const data = { type: 'prompt', prompt };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            },
            onChunk: (chunk: string, isTitle: boolean) => {
              const data = {
                type: isTitle ? 'title' : 'content',
                chunk: chunk
              };
              console.log('Sending chunk:', data);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }
          });

          // Send completion signal
          console.log('Sending completion signal');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Generation error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Unexpected error type:', error);
    }

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