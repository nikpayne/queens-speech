export interface GenerationHistory {
  id: string;
  prompt: string;
  mode?: 'write' | 'rewrite'; // Add mode to distinguish between different generation types
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
  if (typeof window !== 'undefined') {
    const history = getGenerationHistory();
    
    // Check for existing entry with the same prompt AND mode
    const existingIndex = history.findIndex(item => 
      item.prompt === generation.prompt && 
      item.mode === generation.mode
    );
    
    if (existingIndex !== -1) {
      // Update existing entry with new content and timestamp
      const updatedGeneration: GenerationHistory = {
        ...generation,
        id: history[existingIndex].id, // Keep original ID
        timestamp: Date.now(), // Update timestamp
      };
      
      // Replace the existing entry and move it to the front
      const updatedHistory = [
        updatedGeneration,
        ...history.slice(0, existingIndex),
        ...history.slice(existingIndex + 1)
      ];
      
      // Keep only the last 50 generations to avoid localStorage bloat
      const trimmedHistory = updatedHistory.slice(0, 50);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
        console.log('Updated existing generation in localStorage:', updatedGeneration.title);
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
      
      return updatedGeneration;
    } else {
      // Create new entry
      const newGeneration: GenerationHistory = {
        ...generation,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newGeneration, ...history];
      
      // Keep only the last 50 generations to avoid localStorage bloat
      const trimmedHistory = updatedHistory.slice(0, 50);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
        console.log('Saved new generation to localStorage:', newGeneration.title);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      return newGeneration;
    }
  }
  
  // Fallback for server-side rendering
  return {
    ...generation,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
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

export function deleteGeneration(id: string): void {
  if (typeof window !== 'undefined') {
    try {
      const history = getGenerationHistory();
      const updatedHistory = history.filter(generation => generation.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      console.log('Deleted generation from localStorage:', id);
    } catch (error) {
      console.error('Error deleting generation:', error);
    }
  }
} 