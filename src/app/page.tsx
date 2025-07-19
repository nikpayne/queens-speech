"use client";

import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Button,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Box minH="100vh" py={16} bg="purple.50">
      <Container maxW="4xl">
        <Stack spacing={8} textAlign="center">
          {/* Header */}
          <Stack spacing={4}>
            <Text fontSize="6xl">👑</Text>
            <Heading as="h1" size="2xl" color="purple.600">
              Queen&apos;s Speech Generator
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="600px" mx="auto">
              Transform your everyday writing into hilarious Queen Elizabeth II
              Clickhole-style satirical articles using AI
            </Text>
          </Stack>

          {/* Main CTA */}
          <Box
            bg="white"
            p={8}
            borderRadius="lg"
            shadow="xl"
            mx="auto"
            maxW="500px"
          >
            <Stack spacing={6}>
              <Stack spacing={3}>
                <Heading as="h2" size="lg">
                  Ready to Write Like Royalty?
                </Heading>
                <Text color="gray.600">
                  Enter your thoughts, and watch them transform into absurd
                  royal proclamations that would make The Onion proud.
                </Text>
              </Stack>

              <Link href="/generate">
                <Button
                  colorScheme="purple"
                  size="lg"
                  fontSize="xl"
                  px={8}
                  py={6}
                  h="auto"
                >
                  🎭 Start Writing
                </Button>
              </Link>
            </Stack>
          </Box>

          {/* Features */}
          <Stack spacing={6} w="full">
            <Heading as="h3" size="lg">
              Features
            </Heading>

            <HStack
              spacing={6}
              align="stretch"
              flexWrap="wrap"
              justify="center"
            >
              <Box bg="white" p={6} borderRadius="lg" maxW="300px">
                <Stack spacing={3} align="center">
                  <Text fontSize="3xl">🤖</Text>
                  <Heading as="h4" size="md">
                    AI-Powered
                  </Heading>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Uses advanced AI to transform your writing into satirical
                    masterpieces
                  </Text>
                </Stack>
              </Box>

              <Box bg="white" p={6} borderRadius="lg" maxW="300px">
                <Stack spacing={3} align="center">
                  <Text fontSize="3xl">📚</Text>
                  <Heading as="h4" size="md">
                    Style References
                  </Heading>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Automatically selects relevant reference articles to match
                    your input
                  </Text>
                </Stack>
              </Box>

              <Box bg="white" p={6} borderRadius="lg" maxW="300px">
                <Stack spacing={3} align="center">
                  <Text fontSize="3xl">🎭</Text>
                  <Heading as="h4" size="md">
                    Multiple Tones
                  </Heading>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Choose from absurd, dignified, or scandalous writing styles
                  </Text>
                </Stack>
              </Box>
            </HStack>
          </Stack>

          {/* Examples */}
          <Box bg="white" p={6} borderRadius="lg" w="full">
            <Stack spacing={4}>
              <Heading as="h3" size="lg">
                Example Transformations
              </Heading>

              <Stack spacing={4}>
                <Box p={4} bg="gray.50" borderRadius="md" textAlign="left">
                  <Text fontWeight="bold" color="purple.600" mb={2}>
                    Your Input:
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    &quot;I started learning to cook during quarantine&quot;
                  </Text>
                </Box>

                <Text fontSize="xl">↓</Text>

                <Box p={4} bg="purple.50" borderRadius="md" textAlign="left">
                  <Text fontWeight="bold" color="purple.600" mb={2}>
                    Generated Article:
                  </Text>
                  <Text fontSize="sm" color="gray.700" fontStyle="italic">
                    &quot;BREAKING: Queen Elizabeth II Announces She&apos;s Been
                    Running Secret Underground Cooking Competition in Palace
                    Kitchen Since 2020...&quot;
                  </Text>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Footer */}
          <Text fontSize="sm" color="gray.500" mt={8}>
            Powered by Anthropic Claude • Built with Next.js & Chakra UI
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
