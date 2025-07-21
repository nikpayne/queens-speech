export interface GenerationHistory {
  id: string;
  prompt: string;
  title: string;
  content: string;
  timestamp: number;
  usedReferences?: Array<{
    title: string;
    filename: string;
  }>;
}

const STORAGE_KEY = 'queens-speech-history';

export function saveGeneration(generation: Omit<GenerationHistory, 'id' | 'timestamp'>): GenerationHistory {
  const newGeneration: GenerationHistory = {
    ...generation,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    const history = getGenerationHistory();
    const updatedHistory = [newGeneration, ...history];
    
    // Keep only the last 50 generations to avoid localStorage bloat
    const trimmedHistory = updatedHistory.slice(0, 50);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
      console.log('Saved generation to localStorage:', newGeneration.title);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  return newGeneration;
}

export function getGenerationHistory(): GenerationHistory[] {
  if (typeof window === 'undefined') {
    return []; // Return empty array during server-side rendering
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history = stored ? JSON.parse(stored) : [];
    console.log('Loaded generation history from localStorage:', history.length, 'items');
    return history;
  } catch (error) {
    console.error('Error loading generation history:', error);
    return [];
  }
}

export function clearGenerationHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared generation history from localStorage');
  }
} 