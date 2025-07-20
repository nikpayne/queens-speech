import { Box, Text, Stack, Image } from "@chakra-ui/react";

interface ArticleStationaryProps {
  content: string;
}

export default function ArticleStationary({ content }: ArticleStationaryProps) {
  // Get today's date formatted nicely
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Box
      bg="#FCFCF1"
      p={8}
      borderRadius="md"
      border="1px solid #E2E8F0"
      boxShadow="lg"
      maxW="full"
      fontFamily="monospace"
      minH="100vh"
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

        {/* Date section */}
        <Box textAlign="right">
          <Text
            fontFamily="monospace"
            fontSize="sm"
            color="gray.700"
            letterSpacing="0.02em"
          >
            {formattedDate}
          </Text>
        </Box>

        {/* Article content */}
        <Box>
          <Text
            fontFamily="monospace"
            fontSize="sm"
            lineHeight="1.8"
            whiteSpace="pre-wrap"
            color="gray.800"
            letterSpacing="0.02em"
          >
            {content}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
