import { NextRequest, NextResponse } from 'next/server';
import { generateQueenElizabethClickhole, type GenerationMode } from '@/lib/generator';
import { getAllReferences, type ReferenceArticle } from '@/lib/referencePicker';
import {
  DEFAULT_MODEL_TIER,
  DEFAULT_SAMPLE_COUNT,
  GENERATION_TEMPERATURE,
  MAX_TEMPERATURE,
  MAX_SAMPLE_COUNT,
  MIN_TEMPERATURE,
  type ModelTier,
} from '@/lib/generationConfig';

// Shuffle-bag sampler to reduce short-term repeat bias.
// Instead of independent random picks each request, we cycle through a shuffled
// pool of references and only reshuffle once exhausted.
let referenceShuffleBag: string[] = [];

function refillShuffleBag(references: ReferenceArticle[]) {
  referenceShuffleBag = references.map((ref) => ref.filename);
  for (let i = referenceShuffleBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [referenceShuffleBag[i], referenceShuffleBag[j]] = [
      referenceShuffleBag[j],
      referenceShuffleBag[i],
    ];
  }
}

function pickFromShuffleBag(
  references: ReferenceArticle[],
  sampleCount: number
): ReferenceArticle[] {
  const byFilename = new Map(references.map((ref) => [ref.filename, ref]));
  const desired = Math.min(sampleCount, references.length);
  const selected: ReferenceArticle[] = [];

  while (selected.length < desired) {
    if (referenceShuffleBag.length === 0) {
      refillShuffleBag(references);
    }
    const filename = referenceShuffleBag.shift();
    if (!filename) break;
    const ref = byFilename.get(filename);
    if (!ref) continue;
    // Prevent duplicates within a single request.
    if (selected.some((item) => item.filename === ref.filename)) continue;
    selected.push(ref);
  }

  return selected;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userInput,
      mode = "write",
      sampleCount = DEFAULT_SAMPLE_COUNT,
      modelTier = DEFAULT_MODEL_TIER,
      temperature = GENERATION_TEMPERATURE,
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

    if (
      typeof temperature !== 'number' ||
      Number.isNaN(temperature) ||
      temperature < MIN_TEMPERATURE ||
      temperature > MAX_TEMPERATURE
    ) {
      return NextResponse.json(
        { error: `temperature must be between ${MIN_TEMPERATURE} and ${MAX_TEMPERATURE}` },
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

    // Pick references from a shuffle-bag to avoid heavy short-run repetition.
    const relevantReferences = pickFromShuffleBag(allReferences, sampleCount);

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
            temperature,
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