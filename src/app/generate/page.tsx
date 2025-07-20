"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Stack,
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
      <Container maxW="2xl" mx="auto">
        <Stack gap={6}>
          {/* Main Content - Single Column with Overlay */}
          <Box position="relative" w="full">
            {/* Default Empty Stationary or Streaming Content */}
            <Box>
              {/* Show loading phrase only when loading and no streaming content yet */}
              {isLoading && !streamingContent && (
                <ArticleStationary content={loadingPhrase} />
              )}

              {/* Show streaming content as it comes in */}
              {streamingContent && (
                <ArticleStationary content={streamingContent} />
              )}

              {/* Show final result when streaming is complete */}
              {result && !isLoading && !streamingContent && (
                <>
                  {result.success ? (
                    <ArticleStationary content={result.article || ""} />
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
                <ArticleStationary content="" />
              )}
            </Box>

            {/* Post-it Note Input Overlay */}
            {!isLoading && (
              <Box
                position="absolute"
                top="120px"
                left="60px"
                zIndex={10}
                transform="rotate(-1.5deg)"
                bg="yellow.200"
                p={4}
                borderRadius="sm"
                boxShadow="lg"
                border="1px solid"
                borderColor="yellow.300"
                maxW="300px"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "-8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "40px",
                  height: "15px",
                  bg: "yellow.100",
                  borderRadius: "sm",
                  border: "1px solid",
                  borderColor: "yellow.300",
                }}
              >
                <Stack gap={3}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                    ✍️ Note to Her Majesty
                  </Text>

                  <Textarea
                    placeholder="Write your message to the Queen here..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={4}
                    resize="none"
                    maxLength={2000}
                    bg="transparent"
                    border="none"
                    outline="none"
                    _focus={{
                      boxShadow: "none",
                      border: "none",
                    }}
                    fontSize="sm"
                    fontFamily="cursive"
                    color="gray.800"
                  />

                  <Text fontSize="xs" color="gray.500" textAlign="right">
                    {userInput.length}/2000
                  </Text>

                  <Button
                    colorScheme="purple"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={!userInput.trim() || isLoading}
                    borderRadius="sm"
                  >
                    Send to the Queen 👑
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>

          {/* Reference Info at Bottom */}
          <Stack gap={4}>
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
