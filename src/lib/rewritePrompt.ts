import type { ReferenceArticle } from './referencePicker';

export function generateRewritePrompt(userInput: string, references: ReferenceArticle[]): string {
  const referencesText = references.map((ref, index) => {
    return `REFERENCE EXAMPLE ${index + 1}:
Title: ${ref.title}
Content: ${ref.content.substring(0, 1000)}...

---

`;
  }).join('');

  return `Your job is to rewrite existing text in the style of Clickhole.com's Queen Elizabeth articles. They are funny, and have a very distinct style and tone, and are full of misspellings, typos and absurd syntax.

I will be providing you some writing samples of real clickhole articles, and your job is to rewrite the provided text to match this style exactly.

EXISTING TEXT TO REWRITE:
"${userInput}"

WRITING SAMPLES:
Use the following writing samples as a guide for the style and tone of the output.
${referencesText}


- Take the existing text and rewrite it completely in the Queen Elizabeth Clickhole style. 
- Keep the core meaning and ideas, but transform the language, tone, and structure to match the reference examples. 
- Add misspellings, typos, absurd syntax, and the distinctive voice shown in the samples.
- Do NOT add a title or introduction to the output
- Do NOT write an entire article, just rewrite the existing text in the style of the reference examples
- The number of paragraphs you return should be the same as the input
- The sentences in those paragraphscan be shorter or longer as needed


Example input: 
I have lived a long and happy life, I am tired, and I no longer fear death

Example output:
Sometimes when your very tire of life you just want to crawl into you're favrite casket and take the biggest nap of you're life (death).



Now rewrite this text:`;
} 