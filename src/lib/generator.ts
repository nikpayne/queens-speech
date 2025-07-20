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

Please return your response in the following JSON format:
{
  "title": "Your clickhole-style title here",
  "body": "The complete article body here"
}

Make sure the title is catchy and in Clickhole style, and the body is the full article content.`;

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
      try {
        const parsed = JSON.parse(content.text);
        return {
          title: parsed.title || "Untitled Article",
          body: parsed.body || content.text
        };
      } catch (parseError) {
        // If JSON parsing fails, try to extract title and body manually
        const text = content.text;
        const lines = text.split('\n');
        const titleLine = lines.find(line => line.trim().length > 0);
        const bodyStartIndex = lines.findIndex(line => line.trim().length > 0) + 1;
        const body = lines.slice(bodyStartIndex).join('\n').trim();
        
        return {
          title: titleLine?.trim() || "Generated Article",
          body: body || text
        };
      }
    } else {
      throw new Error('Unexpected response type from Anthropic API');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
} 