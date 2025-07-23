import {
  Box,
  HStack,
  Flex,
  Text,
  Stack,
  Image,
  IconButton,
  ButtonGroup,
} from "@chakra-ui/react";
import { MdContentCopy, MdDelete } from "react-icons/md";
import { useState } from "react";

interface ArticleStationaryProps {
  content: string;
  title?: string;
  showSignature?: boolean;
  showPaperHolders?: boolean;
  error?: string;
  onDelete?: () => void;
  onCopy?: () => void;
}

export default function ArticleStationary({
  content,
  title = "",
  showSignature = false,
  showPaperHolders = false,
  error = "",
  onDelete,
  onCopy,
}: ArticleStationaryProps) {
  const [isHovered, setIsHovered] = useState(false);

  const textStyling = {
    fontFamily: "monospace",
    fontSize: "sm",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    color: "gray.800",
  };

  const handleCopy = () => {
    if (onCopy && content) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          onCopy();
        })
        .catch((err) => {
          console.error("Failed to copy content: ", err);
        });
    }
  };

  const showButtons = showSignature && (onDelete || onCopy);

  return (
    <Stack
      bg="#FCFCF1"
      p={8}
      borderRadius="sm"
      border="1px solid hsl(60, 30.70%, 92%)"
      boxShadow="md"
      maxW="full"
      fontFamily="monospace"
      minH="900px"
      justifyContent="space-between"
      gap={6}
      // filter={!content ? "blur(1.5px)" : "none"}
      // transition="filter 0.3s ease-in-out"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Paper holders at corners */}
      {showPaperHolders && <PaperHolders />}

      {/* Copy and Delete buttons - only shown on hover and for finished generations */}
      {showButtons && (
        <ButtonGroup
          size="sm"
          variant="ghost"
          position="absolute"
          top={4}
          right={4}
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.2s ease-in-out"
          bg="white"
          boxShadow="sm"
          borderRadius="md"
          p={1}
        >
          {onCopy && (
            <IconButton
              aria-label="Copy article"
              onClick={handleCopy}
              _hover={{ bg: "gray.100" }}
            >
              <MdContentCopy />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              aria-label="Delete article"
              onClick={onDelete}
              _hover={{ bg: "red.100", color: "red.600" }}
            >
              <MdDelete />
            </IconButton>
          )}
        </ButtonGroup>
      )}

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

const PaperHolders = () => {
  // Paper holder triangle styles
  const OFFSET = 2;
  const PAPER_HOLDER_SIZE = 16;
  const paperHolderStyle = {
    position: "absolute" as const,
    width: PAPER_HOLDER_SIZE,
    height: PAPER_HOLDER_SIZE,
    bg: "#2D3748",
    zIndex: 10,
  };

  return (
    <>
      {/* Top-left corner */}
      <Box
        {...paperHolderStyle}
        top={`-${OFFSET}`}
        left={`-${OFFSET}`}
        clipPath="polygon(0 0, 100% 0, 0 100%)"
      />
      {/* Top-right corner */}
      <Box
        {...paperHolderStyle}
        top={`-${OFFSET}`}
        right={`-${OFFSET}`}
        clipPath="polygon(100% 0, 100% 100%, 0 0)"
      />
      {/* Bottom-left corner */}
      <Box
        {...paperHolderStyle}
        bottom={`-${OFFSET}`}
        left={`-${OFFSET}`}
        clipPath="polygon(0 0, 100% 100%, 0 100%)"
      />
      {/* Bottom-right corner */}
      <Box
        {...paperHolderStyle}
        bottom={`-${OFFSET}`}
        right={`-${OFFSET}`}
        clipPath="polygon(100% 0, 100% 100%, 0 100%)"
      />
    </>
  );
};
