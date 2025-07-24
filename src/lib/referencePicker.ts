import { promises as fs } from 'fs';
import path from 'path';

export interface ReferenceArticle {
  filename: string;
  content: string;
  title: string;
}

export async function getAllReferences(): Promise<ReferenceArticle[]> {
  try {
    const clickholeDir = path.join(process.cwd(), 'data', 'clickhole');
    const files = await fs.readdir(clickholeDir);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    const references: ReferenceArticle[] = [];
    
    for (const file of txtFiles) {
      const filePath = path.join(clickholeDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const title = content.split('\n')[0] || file; // Use first line as title
      
      references.push({
        filename: file,
        content,
        title
      });
    }
    
    return references;
  } catch (error) {
    console.error('Error reading reference files:', error);
    return [];
  }
}

export function pickRelevantReferences(
  userInput: string, 
  references: ReferenceArticle[], 
  maxReferences: number = 2
): ReferenceArticle[] {
  // Simple keyword-based relevance scoring
  // In a more sophisticated version, you could use embeddings or semantic similarity
  
  const keywords = userInput.toLowerCase().split(/\s+/);
  
  const scoredReferences = references.map(ref => {
    const refText = ref.content.toLowerCase();
    let score = 0;
    
    // Score based on keyword matches
    keywords.forEach(keyword => {
      if (keyword.length > 2) { // Skip very short words
        // Escape special regex characters to prevent invalid regex
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matches = (refText.match(new RegExp(escapedKeyword, 'g')) || []).length;
        score += matches;
      }
    });
    
    // Boost score for title matches
    const titleMatches = keywords.filter(keyword => 
      ref.title.toLowerCase().includes(keyword)
    ).length;
    score += titleMatches * 3;
    
    return { ref, score };
  });
  
  // Sort by score (descending) and take top references
  scoredReferences.sort((a, b) => b.score - a.score);
  
  // If no references have a good score, just return the first few
  if (scoredReferences[0]?.score === 0) {
    return references.slice(0, maxReferences);
  }
  
  return scoredReferences
    .slice(0, maxReferences)
    .map(item => item.ref);
}

export function pickRandomReferences(
  references: ReferenceArticle[], 
  maxReferences: number = 2
): ReferenceArticle[] {
  // Create a copy of the references array to avoid mutating the original
  const shuffled = [...references];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the first maxReferences items
  return shuffled.slice(0, Math.min(maxReferences, shuffled.length));
}

export function formatReferencesForPrompt(references: ReferenceArticle[]): string {
  return references.map((ref, index) => {
    return `REFERENCE EXAMPLE ${index + 1}:
Title: ${ref.title}
Content: ${ref.content}

---

`;
  }).join('');
} 