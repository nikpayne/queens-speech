import { Box, HStack, Flex, Text, Stack, Image } from "@chakra-ui/react";

interface ArticleStationaryProps {
  content: string;
  title?: string;
  showSignature?: boolean;
}

export default function ArticleStationary({
  content,
  title = "",
  showSignature = false,
}: ArticleStationaryProps) {
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
          <Text
            fontFamily="monospace"
            fontSize="sm"
            lineHeight="1.8"
            whiteSpace="pre-wrap"
            color="gray.800"
          >
            {content}
          </Text>
        </Box>
      </Stack>

      <HStack gap="6" alignItems="flex-start">
        <Flex>
          {/* Please put the title here */}
          <Text
            color="gray.400"
            fontSize="sm"
            fontFamily="'Homemade Apple', 'Beth Ellen', 'La Belle Aurore', serif"
            transform="rotate(-0.1deg)"
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
