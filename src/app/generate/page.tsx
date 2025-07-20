"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Stack,
  HStack,
  Heading,
  Text,
  Textarea,
  Button,
} from "@chakra-ui/react";
import ArticleStationary from "@/components/ArticleStationary";

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

export default function GeneratePage() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingTitle, setStreamingTitle] = useState("");

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
              console.log("Received data:", data);

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
                setResult({
                  success: true,
                  title: accumulatedTitle,
                  article: accumulatedContent,
                  usedReferences: usedReferences,
                });
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
    <Box minH="100vh" py={8}>
      <Container maxW="6xl" mx="auto">
        <Stack gap={6}>
          {/* Main Content */}
          <HStack
            gap={8}
            align="start"
            flexWrap={{ base: "wrap", lg: "nowrap" }}
          >
            {/* Input Section */}
            <Box
              flex="1"
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              minW={{ base: "full", lg: "400px" }}
            >
              <Stack gap={4}>
                <Heading as="h3" size="md">
                  ✍️ Your Input
                </Heading>

                <Textarea
                  placeholder="Enter your text here to transform it into a Queen Elizabeth II Clickhole article... 
                    Examples:
                    - 'I'm starting a new hobby'
                    - 'My cat won't stop meowing'
                    - 'I discovered a new restaurant'
                    - 'I'm learning to cook'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={8}
                  resize="vertical"
                  maxLength={2000}
                />

                <Text fontSize="sm" color="gray.500" textAlign="right">
                  {userInput.length}/2000 characters
                </Text>

                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!userInput.trim() || isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Article"}
                </Button>
              </Stack>
            </Box>

            {/* Results Section */}
            <Box
              flex="1"
              borderRadius="lg"
              minW={{ base: "full", lg: "400px" }}
            >
              <Stack gap={4}>
                {/* Show loading phrase only when loading and no streaming content yet */}
                {isLoading && !streamingContent && (
                  <Box maxH="600px" overflowY="auto">
                    <ArticleStationary content={loadingPhrase} />
                  </Box>
                )}

                {/* Show streaming content as it comes in */}
                {streamingContent && (
                  <Box overflowY="auto">
                    <ArticleStationary content={streamingContent} />
                  </Box>
                )}

                {/* Show final result when streaming is complete */}
                {result && !isLoading && !streamingContent && (
                  <>
                    {result.success ? (
                      <Box overflowY="auto">
                        <ArticleStationary content={result.article || ""} />
                      </Box>
                    ) : (
                      <Box
                        bg="red.50"
                        border="1px solid"
                        borderColor="red.200"
                        p={4}
                        borderRadius="md"
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

                {/* Show placeholder when nothing is happening */}
                {!result && !isLoading && !streamingContent && (
                  <Box textAlign="center" py={8} color="gray.500">
                    <Text>Your generated article will appear here</Text>
                    <Text fontSize="sm" mt={2}>
                      Enter some text and click &quot;Generate Article&quot; to
                      begin
                    </Text>
                  </Box>
                )}
              </Stack>
            </Box>
          </HStack>

          {/* Instructions */}
          <Stack gap={4}>
            {/* Reference Info */}
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
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
