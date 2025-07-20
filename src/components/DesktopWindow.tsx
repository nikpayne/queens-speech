import { Box, HStack, Text } from "@chakra-ui/react";
import ArticleStationary from "./ArticleStationary";

interface DesktopWindowProps {
  content: string;
  title?: string;
  date?: string;
}

export default function DesktopWindow({
  content,
  title,
  date,
}: DesktopWindowProps) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="2xl"
      border="1px solid #E2E8F0"
      overflow="hidden"
    >
      {/* Mac Window Title Bar */}
      <Box
        bg="linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%)"
        borderBottom="1px solid #d1d1d1"
        p={3}
      >
        <HStack gap={0} align="center">
          {/* Traffic Light Buttons */}
          <HStack gap={2} mr={4}>
            <Box
              w="12px"
              h="12px"
              borderRadius="50%"
              bg="#ff5f57"
              border="1px solid #e0443e"
            />
            <Box
              w="12px"
              h="12px"
              borderRadius="50%"
              bg="#ffbd2e"
              border="1px solid #dea123"
            />
            <Box
              w="12px"
              h="12px"
              borderRadius="50%"
              bg="#28ca42"
              border="1px solid #1aad29"
            />
          </HStack>

          {/* Window Title */}
          <Text
            fontSize="sm"
            fontWeight="medium"
            color="gray.700"
            flex="1"
            textAlign="center"
            mr={12} // Offset to center the title properly
            noOfLines={1}
          >
            {title || "Untitled memo"}
          </Text>
        </HStack>
      </Box>

      {/* Content Area */}
      <Box>
        <ArticleStationary content={content} date={date} />
      </Box>
    </Box>
  );
}
