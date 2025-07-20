import Anthropic from '@anthropic-ai/sdk';
import type { ReferenceArticle } from './referencePicker';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerationRequest {
  userInput: string;
  references: ReferenceArticle[];
}

interface GenerationResult {
  title: string;
  body: string;
}

export async function generateQueenElizabethClickhole(
  request: GenerationRequest
): Promise<GenerationResult> {
  const { userInput, references } = request;

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

Write a complete Clickhole-style article. Start with the title on the first line, then a blank line, then the article body. Do not use any JSON formatting, quotes, or special characters around the title or body. Just write the title and article naturally.

Example format:
My Amazing Title Here

This is the article body content that follows...

Now write your article:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.8,
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
      
      // Split the response into lines
      const lines = responseText.split('\n');
      
      // Find the first non-empty line as the title
      let titleIndex = 0;
      while (titleIndex < lines.length && lines[titleIndex].trim() === '') {
        titleIndex++;
      }
      
      if (titleIndex >= lines.length) {
        // No content found, return fallback
        return {
          title: "Generated Article",
          body: responseText
        };
      }
      
      const title = lines[titleIndex].trim();
      
      // Find the start of the body (skip empty lines after title)
      let bodyStartIndex = titleIndex + 1;
      while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === '') {
        bodyStartIndex++;
      }
      
      // Join the remaining lines as the body
      const bodyLines = lines.slice(bodyStartIndex);
      const body = bodyLines.join('\n').trim();
      
      return {
        title: title || "Generated Article",
        body: body || "Article content not found"
      };
    } else {
      throw new Error('Unexpected response type from Anthropic API');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
} 