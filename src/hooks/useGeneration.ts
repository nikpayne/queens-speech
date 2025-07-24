import { useState } from "react";
import { saveGeneration, getGenerationHistory } from "@/lib/storage";
import type { GenerationMode } from "@/lib/generator";

interface GenerationResult {
  success: boolean;
  title?: string;
  article?: string;
  usedReferences?: Array<{
    title: string;
    filename: string;
  }>;
  error?: string;
}

interface UseGenerationReturn {
  handleGenerate: (userInput: string, mode: GenerationMode) => Promise<void>;
  result: GenerationResult | null;
  isLoading: boolean;
  streamingContent: string;
  streamingTitle: string;
}

interface UseGenerationOptions {
  onGenerationSaved?: () => void;
}

export function useGeneration(options: UseGenerationOptions = {}): UseGenerationReturn {
  const { onGenerationSaved } = options;
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingTitle, setStreamingTitle] = useState("");

  const handleGenerate = async (userInput: string, mode: GenerationMode) => {
    if (!userInput.trim()) {
      setResult({
        success: false,
        error: "Please enter some text to transform",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStreamingContent("");
    setStreamingTitle("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
          mode: mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let usedReferences: Array<{ title: string; filename: string }> = [];
      let accumulatedTitle = "";
      let accumulatedContent = "";

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "metadata") {
                usedReferences = data.usedReferences;
              } else if (data.type === "title") {
                accumulatedTitle += data.chunk;
                setStreamingTitle(accumulatedTitle);
              } else if (data.type === "content") {
                accumulatedContent += data.chunk;
                setStreamingContent(accumulatedContent);
              } else if (data.type === "complete") {
                // Streaming complete
                const finalResult = {
                  success: true,
                  title: accumulatedTitle,
                  article: accumulatedContent,
                  usedReferences: usedReferences,
                };
                setResult(finalResult);

                // Save to localStorage
                if (finalResult.article) {
                  saveGeneration({
                    prompt: userInput,
                    mode: mode,
                    title: finalResult.title || "",
                    content: finalResult.article,
                    usedReferences: usedReferences,
                  });
                  // Notify parent component that a generation was saved
                  onGenerationSaved?.();
                }

                // Clear streaming content so final result shows
                setStreamingContent("");
                setStreamingTitle("");
              } else if (data.type === "error") {
                setResult({
                  success: false,
                  error: data.error,
                });
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setResult({
        success: false,
        error: "Failed to connect to the API. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGenerate,
    result,
    isLoading,
    streamingContent,
    streamingTitle,
  };
} 