import Anthropic from '@anthropic-ai/sdk';
import type { ReferenceArticle } from './referencePicker';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerationRequest {
  userInput: string;
  references: ReferenceArticle[];
}

export async function generateQueenElizabethClickhole(
  request: GenerationRequest
): Promise<string> {
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


Write the complete article now:`;

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
      return content.text;
    } else {
      throw new Error('Unexpected response type from Anthropic API');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
} 