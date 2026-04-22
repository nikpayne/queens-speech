import type { ReferenceArticle } from './referencePicker';

export function generateWritePrompt(userInput: string, references: ReferenceArticle[]): string {
  const referencesText = references.map((ref, index) => {
    return `REFERENCE EXAMPLE ${index + 1}:
Title: ${ref.title}
Content: ${ref.content.substring(0, 1000)}...

---

`;
  }).join('');

  return `Your job is to write in the style of Clickhole.com's Queen Elizabeth articles. They are funny, and have a very distinct style and tone, and are full of misspellings, typos and absurd syntax.

I will be providing you some writing samples of real clickhole articles, and your job is to turn translate the user's input into the same style.

USER INPUT TO TRANSFORM:
"${userInput}"

WRITING SAMPLES:
${referencesText}

Write a complete Clickhole-style article in the style of the reference examples. 
- Lean into the absurdities of the writing style. Syntax, typos, misspellings, distinctive and funny
- When there are multiple samples, mix elements of both styles in the output
- Embody the queen and her personality in the output
- The output length should not be longer than 2X the longest reference example. The queen has limited energy and attention span.

Write the article content FIRST, then on a new line after "TITLE:" write the clickhole-style title. 

Example format:
This is the article body content that comes first...

More article content here...

TITLE: My Amazing Clickhole Title Here

Now write your article:`;
} 