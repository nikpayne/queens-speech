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
  Spinner,
} from "@chakra-ui/react";

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
    <Box minH="100vh" py={8} bg="gray.50">
      <Container maxW="7xl">
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
                  <Box textAlign="center" py={8}>
                    <Spinner size="xl" color="purple.500" />
                    <Text mt={4} color="gray.600">
                      Her Majesty is crafting your article...
                    </Text>
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
                        <Box
                          p={4}
                          bg="gray.50"
                          borderRadius="md"
                          borderLeft="4px solid"
                          borderLeftColor="purple.500"
                          maxH="600px"
                          overflowY="auto"
                        >
                          {/* Article Title */}
                          {result.title && (
                            <Heading
                              as="h2"
                              size="lg"
                              mb={4}
                              color="purple.600"
                              fontFamily="serif"
                              lineHeight="1.3"
                            >
                              {result.title}
                            </Heading>
                          )}

                          {/* Article Body */}
                          <Text
                            whiteSpace="pre-wrap"
                            fontSize="sm"
                            lineHeight="1.6"
                            fontFamily="serif"
                          >
                            {result.article}
                          </Text>
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
