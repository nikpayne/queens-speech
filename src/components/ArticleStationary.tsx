import { Box, HStack, Flex, Text, Stack, Image } from "@chakra-ui/react";

interface ArticleStationaryProps {
  content: string;
  title?: string;
  showSignature?: boolean;
  error?: string;
}

export default function ArticleStationary({
  content,
  title = "",
  showSignature = false,
  error = "",
}: ArticleStationaryProps) {
  const textStyling = {
    fontFamily: "monospace",
    fontSize: "sm",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    color: "gray.800",
  };
  return (
    <Stack
      bg="#FCFCF1"
      p={8}
      borderRadius="md"
      border="1px solid #E2E8F0"
      boxShadow="lg"
      maxW="full"
      fontFamily="monospace"
      minH="900px"
      justifyContent="space-between"
      gap={6}
      filter={!content ? "blur(1.5px)" : "none"}
      transition="filter 0.3s ease-in-out"
    >
      <Stack direction="column" gap={6}>
        {/* Header section for Buckingham Palace logo */}
        <Box textAlign="center" py={4}>
          <Box
            h="120px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              src="/buckingham-palace.svg"
              alt="Buckingham Palace"
              h="100px"
              w="auto"
              objectFit="contain"
            />
          </Box>
        </Box>

        {/* Article content */}
        <Box>
          <Text {...textStyling}>{content}</Text>
          {error && (
            <Text {...textStyling} color="red.500">
              {error}
            </Text>
          )}
        </Box>
      </Stack>

      <HStack
        gap="6"
        // alignItems="flex-start"

        alignItems="stretch"
      >
        <Flex>
          {/* Please put the title here */}
          <Text
            color="gray.400"
            fontSize="sm"
            fontFamily="'Homemade Apple', 'Beth Ellen', 'La Belle Aurore', serif"
            transform="rotate(-0.1deg)"
            py={2}
          >
            {title.toLowerCase()}
          </Text>
        </Flex>
        <Image
          opacity={showSignature ? 1 : 0}
          transition="opacity 0.6s ease-in-out 0.5s"
          src="/elizabeth-signature.svg"
          maxH="16"
          objectFit="contain"
          alt="Queen elizabeth signature"
        />
      </HStack>
    </Stack>
  );
}
