"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Image,
  Container,
  Stack,
  Text,
  HStack,
  Flex,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import DesktopWindow from "@/components/DesktopWindow";
import MemoNotepad from "@/components/MemoNotepad";
import ArticleStationary from "@/components/ArticleStationary";
import {
  saveGeneration,
  getGenerationHistory,
  deleteGeneration,
  GenerationHistory,
} from "@/lib/storage";

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

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingTitle, setStreamingTitle] = useState("");
  const [generationHistory, setGenerationHistory] = useState<
    GenerationHistory[]
  >([]);
  // For now, we'll use a simple feedback system without toast
  // const toast = useToast();

  useEffect(() => {
    // Load generation history on component mount
    const history = getGenerationHistory();
    setGenerationHistory(history);
  }, []);

  const handleDelete = (id: string) => {
    deleteGeneration(id);
    const updatedHistory = getGenerationHistory();
    setGenerationHistory(updatedHistory);
    console.log("Article deleted successfully");
  };

  const handleCopy = () => {
    console.log("Article copied to clipboard");
  };

  const handleGenerate = async () => {
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
                if (accumulatedTitle && accumulatedContent) {
                  saveGeneration({
                    prompt: userInput,
                    title: accumulatedTitle,
                    content: accumulatedContent,
                    usedReferences: usedReferences,
                  });
                  // Update local state with new history
                  const updatedHistory = getGenerationHistory();
                  setGenerationHistory(updatedHistory);
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

  const articleContent =
    result && result.success ? result.article || "" : streamingContent || "";
  const articleTitle =
    result && result.success ? result.title || "" : streamingTitle || "";
  const showSignature = Boolean(
    result && result.success && !isLoading && !streamingContent
  );

  return (
    <Box bg="gray.50" minH="100vh">
      <Grid
        gridTemplateAreas={{
          base: `
          "notepad"
          "article"
          "other"
        `,
          lg: `
          "notepad article other"
        `,
        }}
        gridTemplateColumns={{
          base: `1fr`,
          lg: `2fr 4.5fr 2fr`,
        }}
        maxW="8xl"
        mx="auto"
        py="8"
        gap="6"
        px="6"
      >
        <GridItem area="notepad" position="relative">
          {/* I want box to be sticky */}
          <Box>
            <MemoNotepad
              userInput={userInput}
              onUserInputChange={setUserInput}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </Box>
        </GridItem>
        <GridItem area="article">
          <Stack>
            <ArticleStationary
              content={articleContent}
              title={articleTitle}
              showSignature={showSignature}
              error={result?.error}
            />
            {generationHistory.length > 0 &&
              !isLoading &&
              !streamingContent && (
                <Stack gap={6} mt={8}>
                  {(result
                    ? generationHistory.slice(1)
                    : generationHistory
                  ).map((generation) => (
                    <ArticleStationary
                      key={generation.id}
                      content={generation.content}
                      title={generation.title}
                      showSignature={true}
                      onDelete={() => handleDelete(generation.id)}
                      onCopy={handleCopy}
                    />
                  ))}
                </Stack>
              )}
          </Stack>
        </GridItem>
        <GridItem area="other"></GridItem>
      </Grid>
    </Box>
  );
}
