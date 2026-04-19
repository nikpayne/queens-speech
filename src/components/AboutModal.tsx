"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  Image,
  Link,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";

export default function AboutModal() {
  return (
    <Dialog.Root size="lg" placement="center" scrollBehavior="inside">
      <Dialog.Trigger asChild>
        <Button
          position="fixed"
          bottom={4}
          right={4}
          h="3rem"
          p={0}
          pr={4}
          bg="black"
          color="white"
          borderRadius="md"
          overflow="hidden"
          boxShadow="lg"
          _hover={{ bg: "gray.800" }}
          zIndex={100}
        >
          <Flex align="center" h="100%">
            <Image
              src="/about-thumbnail.png"
              alt="Queen thumbnail"
              // w="2.75rem"
              h="100%"
              objectFit="cover"
              flexShrink={0}
            />
            <Text pl={3} fontFamily="monospace" fontSize="sm" fontWeight="500">
             ???
            </Text>
          </Flex>
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="#FCFCF1" borderRadius="md">
            <Dialog.Header>
              <Dialog.Title fontFamily="monospace">
                About this project
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4} fontFamily="monospace" fontSize="sm" color="gray.800" lineHeight="1.7">
              <Box
                  borderRadius="sm"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="blackAlpha.200"
                  bg="white"
                  maxW="500px"
                >
                  <Image
                    src="/clickhole-example.png"
                    alt="Example ClickHole article: 'I Didm’t Enjoy Ozzu Osbrun’s Muslix...'"
                    w="100%"
                    h="auto"
                    objectFit="contain"
                  />
                </Box>
                <Text>
                  I&apos;ve always loved{" "}
                  <Link
                    href="https://clickhole.com/tag/queen-elizabeth-ii/"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="blue.700"
                    textDecoration="underline"
                  >
                    ClickHole&apos;s Queen Elizabeth II series
                  </Link>. They are short, deeply silly clickbait posts written in a very
                  distinctive, broken voice. 
                </Text>
                <Text>
                  I first tried to get a language model to mirror this voice
                  back in 2022 and it was hopeless. Models really couldn't reproduce the texture of the voice.
                  Since then they've gotten better, and I&apos;ve quietly used &ldquo;write me
                  one of these&rdquo; as an informal, totally unscientific
                  benchmark for how far frontier models have come at imitating
                  a tight, idiosyncratic style. This site is the
                  &ldquo;version&nbsp;1&rdquo; of that test made into a real
                  thing.
                </Text>

                <Heading as="h3" size="sm" fontFamily="monospace" pt={2}>
                  How it works
                </Heading>
                <Text>
                  I wrote a small Python scraper that pulled every Queen
                  Elizabeth II post from{" "}
                  <Link
                    href="https://clickhole.com/tag/queen-elizabeth-ii/"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="blue.700"
                    textDecoration="underline"
                  >
                    clickhole.com
                  </Link>{" "}
                  and saved each one as a plain text file under{" "}
                  <Text as="span" fontFamily="monospace" bg="blackAlpha.100" px={1}>
                    data/clickhole/
                  </Text>
                  . When you ask for a new article, the server picks two of
                  those files at random and few-shots them into the prompt
                  alongside whatever you typed on the notepad, using either a "write" or "rewrite" prompt.
                </Text>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
