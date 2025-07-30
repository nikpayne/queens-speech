import Anthropic from '@anthropic-ai/sdk';
import type { ReferenceArticle } from './referencePicker';
import { generateWritePrompt } from './writePrompt';
import { generateRewritePrompt } from './rewritePrompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type GenerationMode = "write" | "rewrite";

function generateRewriteTitle(userInput: string): string {
  // Take first few words of user input and create a descriptive title
  const words = userInput.trim().split(/\s+/).slice(0, 6);
  const preview = words.join(' ');
  
  // Truncate if too long and add ellipsis
  const maxLength = 50;
  if (preview.length > maxLength) {
    return `Rewritten: ${preview.substring(0, maxLength - 12)}...`;
  }
  
  return `Rewritten: ${preview}`;
}

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
    : generateRewritePrompt(userInput, references);

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

            if (mode === 'rewrite') {
    // For rewrite mode, everything is body content (no title expected)
            onChunk(text, false);
          } else {
            // For write mode, look for title marker
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
      }

      // Parse final result based on mode
      let finalTitle: string;
      let finalBody: string;
      
      if (mode === 'rewrite') {
        // For rewrite mode, entire content is body, generate a descriptive title
        finalBody = fullContent.trim();
        finalTitle = generateRewriteTitle(userInput);
      } else {
        // For write mode, look for title marker
        const titleMarkerIndex = fullContent.indexOf('TITLE:');
        if (titleMarkerIndex !== -1) {
          finalBody = fullContent.substring(0, titleMarkerIndex).trim();
          finalTitle = fullContent.substring(titleMarkerIndex + 6).trim();
        } else {
          // Fallback: treat entire content as body
          finalBody = fullContent.trim();
          finalTitle = "Generated Article";
        }
      }
      
      return {
        title: finalTitle || (mode === 'rewrite' ? generateRewriteTitle(userInput) : "Generated Article"),
        body: finalBody || "Content not found"
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
        
        let title: string;
        let body: string;
        
        if (mode === 'rewrite') {
          // For rewrite mode, entire content is body, generate a descriptive title
          body = responseText;
          title = generateRewriteTitle(userInput);
        } else {
          // For write mode, look for the title marker
          const titleMarkerIndex = responseText.indexOf('TITLE:');
          if (titleMarkerIndex !== -1) {
            // Split at the title marker
            body = responseText.substring(0, titleMarkerIndex).trim();
            title = responseText.substring(titleMarkerIndex + 6).trim();
          } else {
            // Fallback: treat entire content as body
            body = responseText;
            title = "Generated Article";
          }
        }
        
        return {
          title: title || (mode === 'rewrite' ? generateRewriteTitle(userInput) : "Generated Article"),
          body: body || "Content not found"
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