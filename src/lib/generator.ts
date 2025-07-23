import Anthropic from '@anthropic-ai/sdk';
import type { ReferenceArticle } from './referencePicker';
import { generateWritePrompt } from './writePrompt';
import { generateRefinePrompt } from './refinePrompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type GenerationMode = "write" | "refine";

interface GenerationRequest {
  userInput: string;
  mode: GenerationMode;
  references: ReferenceArticle[];
  onChunk?: (chunk: string, isTitle: boolean) => void;
}

interface GenerationResult {
  title: string;
  body: string;
}

export async function generateQueenElizabethClickhole(
  request: GenerationRequest
): Promise<GenerationResult> {
  const { userInput, mode, references, onChunk } = request;

  // Select the appropriate prompt based on mode
  const prompt = mode === "write" 
    ? generateWritePrompt(userInput, references)
    : generateRefinePrompt(userInput, references);

  try {
    if (onChunk) {
      // Handle streaming response
      const stream = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.8,
        stream: true,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      let fullContent = '';
      let title = '';
      let body = '';
      let foundTitleMarker = false;

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullContent += text;

          if (!foundTitleMarker) {
            // Check if we've hit the title marker
            const titleMarkerIndex = fullContent.indexOf('TITLE:');
            if (titleMarkerIndex !== -1) {
              // Found the title marker
              foundTitleMarker = true;
              body = fullContent.substring(0, titleMarkerIndex).trim();
              
              // Start collecting title after "TITLE:"
              const afterMarker = fullContent.substring(titleMarkerIndex + 6).trim();
              if (afterMarker) {
                title = afterMarker;
                onChunk(afterMarker, true); // Send title chunk
              }
            } else {
              // Still in body content, stream it
              onChunk(text, false);
            }
          } else {
            // We're collecting title content
            title += text;
            onChunk(text, true); // Stream title chunks
          }
        }
      }

      // Parse final result
      const titleMarkerIndex = fullContent.indexOf('TITLE:');
      let finalTitle = "Generated Article";
      let finalBody = "Article content not found";
      
      if (titleMarkerIndex !== -1) {
        finalBody = fullContent.substring(0, titleMarkerIndex).trim();
        finalTitle = fullContent.substring(titleMarkerIndex + 6).trim();
      } else {
        // Fallback: treat entire content as body
        finalBody = fullContent.trim();
      }
      
      return {
        title: finalTitle,
        body: finalBody
      };
    } else {
      // Handle non-streaming response (fallback)
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2500,
        temperature: 0.8,
        stream: false,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const responseText = content.text.trim();
        
        // Look for the title marker
        const titleMarkerIndex = responseText.indexOf('TITLE:');
        let title = "Generated Article";
        let body = "Article content not found";
        
        if (titleMarkerIndex !== -1) {
          // Split at the title marker
          body = responseText.substring(0, titleMarkerIndex).trim();
          title = responseText.substring(titleMarkerIndex + 6).trim();
        } else {
          // Fallback: treat entire content as body
          body = responseText;
        }
        
        return {
          title: title || "Generated Article",
          body: body || "Article content not found"
        };
      } else {
        throw new Error('Unexpected response type from Anthropic API');
      }
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
} 