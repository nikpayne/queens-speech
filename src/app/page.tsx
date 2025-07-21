"use client";

import { useState, useEffect } from "react";
import { Box, Image, Container, Stack, Text, HStack } from "@chakra-ui/react";
import DesktopWindow from "@/components/DesktopWindow";
import MemoNotepad from "@/components/MemoNotepad";
import Toast from "@/components/Toast";
import ArticleStationary from "@/components/ArticleStationary";
import {
  saveGeneration,
  getGenerationHistory,
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
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingTitle, setStreamingTitle] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<
    GenerationHistory[]
  >([]);

  const handleCopy = () => {
    setShowToast(true);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  useEffect(() => {
    // Load generation history on component mount
    const history = getGenerationHistory();
    setGenerationHistory(history);
  }, []);

  const loadingPhrases = [
    "thinkimg...",
    "bloggin in",
    "computering",
    "writyng",
    "procesiing thoughnt",
    "cramfting wrdos",
    "brain workign",
    "typyng away",
    "composering",
    "wordsmithing",
    "creafting blogg",
    "assemblyng thoughnt",
    "writyng magesty",
    "bloggin royaly",
    "computler thinkimg",
    "crafyng sentance",
    "processyng wrdos",
    "royaly typyng",
    "bloggin awya",
    "finishyng upp",
    "assemblyng the wrdos togethre",
    "cramfting",
    "royaly processyng blogg contrent",
    "thinkimg very hardley",
    "writyng upp storys",
    "computler wokring magicaly",
    "bloggin",
    "creafting delightfull sentances",
    "processyng",
    "typyng away furiosly",
    "computering the thoughnts",
    "writyng royaly magnificennt bloggs",
    "bloggin magesty",
    "assemblyng wrdos into sentances",
    "creafting",
    "royaly thinkimg aboutt thingss",
    "computler processyng wrdos",
    "writyng upp delightfull contrent",
    "bloggin away magnificentlty",
    "finishyng upp the writyng",
  ];

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

    // Select a random loading phrase
    const randomPhrase =
      loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
    setLoadingPhrase(randomPhrase);

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
                accumulatedTitle = data.chunk;
                setStreamingTitle(data.chunk);
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

  return (
    <Box minH="100vh" py={8} bg="gray.50" position="relative">
      <Container maxW="5xl" mx="auto">
        <Stack gap={6}>
          {/* Main Content - Side by Side Layout */}
          <HStack
            gap={8}
            align="start"
            flexWrap={{ base: "wrap", lg: "nowrap" }}
          >
            {/* Left Side - Notepad and Fountain Pen */}
            <HStack gap={4} align="start" position="sticky">
              {/* Memo Notepad */}
              <MemoNotepad
                userInput={userInput}
                onUserInputChange={setUserInput}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </HStack>

            {/* Desktop Window - Right Side */}
            <Box flex="1" minW="600px">
              {/* Show loading phrase only when loading and no streaming content yet */}
              {isLoading && !streamingContent && (
                // <DesktopWindow content={loadingPhrase} onCopy={handleCopy} />
                <ArticleStationary content={streamingContent} />
              )}

              {/* Show streaming content as it comes in */}
              {streamingContent && (
                // <DesktopWindow content={streamingContent} onCopy={handleCopy} />
                <ArticleStationary content={streamingContent} />
              )}

              {/* Show final result when streaming is complete */}
              {result && !isLoading && !streamingContent && (
                <>
                  {result.success ? (
                    <>
                      {/* <DesktopWindow
                        title={result.title || ""}
                        content={result.article || ""}
                        onCopy={handleCopy}
                      />  */}
                      <ArticleStationary content={result.article || ""} />
                    </>
                  ) : (
                    <Box
                      bg="red.50"
                      border="1px solid"
                      borderColor="red.200"
                      p={4}
                      borderRadius="md"
                      m={4}
                    >
                      <Text color="red.800" fontWeight="bold">
                        Generation Failed!
                      </Text>
                      <Text color="red.700" mt={1}>
                        {result.error}
                      </Text>
                    </Box>
                  )}
                </>
              )}

              {/* Show empty stationary by default */}
              {!result && !isLoading && !streamingContent && (
                // <DesktopWindow content="" onCopy={handleCopy} />
                <ArticleStationary content="" />
              )}

              {/* Previous Generations */}
              {generationHistory.length > 0 &&
                !isLoading &&
                !streamingContent && (
                  <Stack gap={6} mt={8}>
                    {(result
                      ? generationHistory.slice(1)
                      : generationHistory
                    ).map((generation) => (
                      <ArticleStationary
                        key={generation.title}
                        content={generation.content}
                      />
                    ))}
                  </Stack>
                )}
            </Box>
          </HStack>

          {/* Reference Info at Bottom */}
          {/* <Stack gap={4}>
            {result &&
              result.usedReferences &&
              result.usedReferences.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    📚 Style References Used:
                  </Text>
                  <Stack direction="row" gap={2} flexWrap="wrap">
                    {result.usedReferences.map((ref, index) => (
                      <Box
                        key={index}
                        bg="purple.100"
                        color="purple.800"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                      >
                        {ref.filename}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
          </Stack> */}
        </Stack>
      </Container>

      {/* Toast Notification */}
      <Toast
        message="The Queen's speech was copied to clipboard! 👑"
        isVisible={showToast}
        onClose={handleCloseToast}
      />
    </Box>
  );
}
