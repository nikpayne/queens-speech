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
  useBreakpointValue,
  Button,
  IconButton,
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

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [mode, setMode] = useState<GenerationMode>("write");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingTitle, setStreamingTitle] = useState("");
  const [generationHistory, setGenerationHistory] = useState<
    GenerationHistory[]
  >([]);

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
                    title: finalResult.title,
                    content: finalResult.article,
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

  const success = result && result.success;
  const articleContent = success
    ? result.article || ""
    : streamingContent || "";
  const articleTitle = success ? result.title || "" : streamingTitle || "";
  const showSignature = Boolean(success && !isLoading && !streamingContent);

  const penImage = useBreakpointValue({
    base: "/fountain-pen-rotated.png",
    lg: "/fountain-pen.png",
  });

  const handleLogLocalStorage = () => {
    const history = getGenerationHistory();
    console.log("=== LOCALSTORAGE DEBUG ===");
    console.log("Total generations:", history.length);
    console.log("Generation history:", history);
    console.log(
      "Raw localStorage data:",
      localStorage.getItem("queens-speech-history")
    );
    console.log("========================");
  };

  return (
    <Box
      minH="100vh"
      bgImage="url('https://media1.thehungryjpeg.com/thumbs2/ori_112089_038b9609023e963d7cc9d48242cb5541e9d03ff5_20-dark-wood-background-textures.jpg')"
      bgAttachment="fixed"
      bgSize="cover"
      bgRepeat="no-repeat"
      position="relative"
    >
      {/* Debug button - top right corner */}
      <Button
        position="fixed"
        top="4"
        right="4"
        size="sm"
        colorScheme="gray"
        variant="solid"
        onClick={handleLogLocalStorage}
        zIndex="1000"
        bg="blackAlpha.700"
        color="white"
        _hover={{ bg: "blackAlpha.800" }}
      >
        Debug Storage
      </Button>
      <Grid
        gridTemplateAreas={{
          base: `
          "pen"
          "notepad"
          "article"
          "other"
        `,
          lg: `
          "pen notepad article other ."
        `,
        }}
        gridTemplateColumns={{
          base: `1fr`,
          lg: `40px 2fr 4.5fr 2fr 40px`,
        }}
        maxW="8xl"
        mx="auto"
        py="8"
        gap="6"
        px="4"
      >
        <GridItem
          area="pen"
          // maxH={{ base: "40px", lg: "none" }}
          // display="flex"
          justifyContent="center"
        >
          <Image
            src={penImage}
            alt="Fountain Pen"
            // maxW={{ base: undefined, lg: "40px" }}
            maxH={{ base: "40px", lg: "100%" }}
            // maxW="100%"
            position="relative"
            mx="auto"
          />
        </GridItem>
        <GridItem area="notepad" position="relative">
          {/* I want box to be sticky */}
          <Box>
            <MemoNotepad
              userInput={userInput}
              mode={mode}
              onUserInputChange={setUserInput}
              onModeChange={setMode}
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
              showPaperHolders={true}
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
