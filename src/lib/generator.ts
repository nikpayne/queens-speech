import Anthropic from '@anthropic-ai/sdk';
import type { ReferenceArticle } from './referencePicker';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerationRequest {
  userInput: string;
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
  const { userInput, references, onChunk } = request;

  const referencesText = references.map((ref, index) => {
    return `REFERENCE EXAMPLE ${index + 1}:
Title: ${ref.title}
Content: ${ref.content.substring(0, 1000)}...

---

`;
  }).join('');

const prompt = 

`Your job is to write in the style of Clickhole.com's Queen Elizabeth articles. They are funny, and have a very distinct style and tone, and are full of misspellings, typos and absurd syntax.

I will be providing you some writing samples of real clickhole articles, and your job is to turn translate the user's input into the same style.

USER INPUT TO TRANSFORM:
"${userInput}"

WRITING SAMPLES:
${referencesText}

Write a complete Clickhole-style article. Write the article content FIRST, then on a new line after "TITLE:" write the clickhole-style title.

Example format:
This is the article body content that comes first...

More article content here...

TITLE: My Amazing Clickhole Title Here

Now write your article:`;

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
        max_tokens: 1500,
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