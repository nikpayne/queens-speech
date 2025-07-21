import { Box, HStack, Text, IconButton } from "@chakra-ui/react";
import { MdContentCopy } from "react-icons/md";
import ArticleStationary from "./ArticleStationary";

interface DesktopWindowProps {
  content: string;
  title?: string;
  onCopy?: () => void;
}

export default function DesktopWindow({
  content,
  title,
  onCopy,
}: DesktopWindowProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      if (onCopy) {
        onCopy();
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
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
            maxLines={1}
          >
            {title || "Untitled memo"}
          </Text>

          {/* Copy Button */}
          {content && (
            <IconButton
              aria-label="Copy to clipboard"
              size="sm"
              variant="ghost"
              color="gray.600"
              onClick={handleCopy}
              _hover={{
                bg: "gray.200",
                color: "gray.800",
              }}
            >
              <MdContentCopy />
            </IconButton>
          )}
        </HStack>
      </Box>

      {/* Content Area */}
      <Box>
        <ArticleStationary content={content} />
      </Box>
    </Box>
  );
}
