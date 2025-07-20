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

      const data = await response.json();
      setResult(data);
    } catch (error) {
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
          {/* Header */}
          <Box textAlign="center">
            <Heading as="h1" size="2xl" mb={2} color="purple.600">
              👑 Queen&apos;s Speech Generator
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Transform your writing into absurd Queen Elizabeth II Clickhole
              articles
            </Text>
          </Box>

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
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              minW={{ base: "full", lg: "400px" }}
            >
              <Stack gap={4}>
                <Heading as="h3" size="md">
                  📰 Generated Article
                </Heading>

                {isLoading && (
                  <Box maxH="600px" overflowY="auto">
                    <ArticleStationary content={loadingPhrase} />
                  </Box>
                )}

                {result && !isLoading && (
                  <>
                    {result.success ? (
                      <Stack gap={4}>
                        {/* Reference Info */}
                        {result.usedReferences &&
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

                        <Box h="1px" bg="gray.200" />

                        {/* Generated Article */}
                        <Box maxH="600px" overflowY="auto">
                          <ArticleStationary content={result.article || ""} />
                        </Box>
                      </Stack>
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

                {!result && !isLoading && (
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
          <Box bg="white" p={6} borderRadius="lg" shadow="md">
            <Heading as="h4" size="sm" mb={3}>
              💡 How to Use
            </Heading>
            <Stack gap={2} fontSize="sm" color="gray.600">
              <Text>
                1. Enter any text or idea in the input box (up to 2000
                characters)
              </Text>
              <Text>
                2. Click &quot;Generate Article&quot; to transform your input
              </Text>
              <Text>
                3. The AI will create a satirical Queen Elizabeth II
                Clickhole-style article
              </Text>
              <Text>
                4. Reference articles are automatically selected to match your
                input&apos;s style
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
