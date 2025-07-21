import { Box, Text, Stack, Image } from "@chakra-ui/react";

interface ArticleStationaryProps {
  content: string;
  showSignature?: boolean;
}

export default function ArticleStationary({
  content,
  showSignature = false,
}: ArticleStationaryProps) {
  return (
    <Box
      bg="#FCFCF1"
      p={8}
      borderRadius="md"
      border="1px solid #E2E8F0"
      boxShadow="lg"
      maxW="full"
      fontFamily="monospace"
      minH="900px"
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

        <Image
          opacity={showSignature ? 1 : 0}
          transition="opacity 0.5s ease-in-out"
          src="/elizabeth-signature.svg"
          maxH="16"
          objectFit="contain"
          alt="Queen elizabeth signature"
        />
      </Stack>
    </Box>
  );
}
