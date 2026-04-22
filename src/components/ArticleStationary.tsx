import {
  Box,
  HStack,
  Flex,
  Text,
  Stack,
  Image,
  IconButton,
  ButtonGroup,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { keyframes } from "@emotion/react";
import { LOADING_PHRASES } from "./constants";

interface ArticleStationaryProps {
  content: string;
  title?: string;
  showSignature?: boolean;
  showPaperHolders?: boolean;
  isLoading?: boolean;
  error?: string;
  onDelete?: () => void;
  isEmpty?: boolean;
  /** 1-based index of the currently shown history item */
  currentIndex?: number;
  /** Total number of history items; pagination only renders when > 1 */
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

const EMPTY_STATE_TITLE = "Welcoem To My Desk , (The Desk Of Qween Elizabath II)";

const EMPTY_STATE_PARAGRAPHS = [
  "You can see my Pensil Cup and my Stappeler and also a Photogrpah of my Horse , his name is Brimbleston , Lovely Horse ,",
  'But the Main Thing is the Notepadd becuase that is what this Desk is All Abuot , you simplay type in there and the Words come Out , sometime I type a Notee and sometime I Rewriet a Texxt that somone has gievn to me and I say "Hmm , Let me Rewrite That" and then I do it on The Noteppad , Very Simpal ,',
  "Welcom again to the Desk , it is my Desk , Enjouy",
];

interface AnimatedLoadingTextProps {
  text: string;
}

function AnimatedLoadingText({ text }: AnimatedLoadingTextProps) {
  const fadeIn = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `;
  // Always strip any caller-supplied trailing punctuation/whitespace and
  // re-append "..." here, so loading state has consistent dots in one place.
  const trimmed = text.replace(/[.\s]+$/u, "");
  const fullText = `${trimmed}...`;
  const TOTAL_DURATION = 0.5; // seconds
  const durationPerChar = TOTAL_DURATION / fullText.length;

  return (
    <Text
      fontFamily="monospace"
      fontSize="sm"
      lineHeight="1.8"
      whiteSpace="pre-wrap"
      color="gray.600"
    >
      {fullText.split("").map((char, index) => (
        <Box
          key={index}
          as="span"
          display="inline-block"
          opacity={0}
          css={{
            animation: `${fadeIn} ${durationPerChar}s ease-out ${
              index * durationPerChar
            }s both`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </Box>
      ))}
    </Text>
  );
}

export default function ArticleStationary({
  content,
  title = "",
  showSignature = false,
  showPaperHolders = false,
  isLoading = false,
  error = "",
  onDelete,
  isEmpty = false,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}: ArticleStationaryProps) {
  const showPagination =
    typeof currentIndex === "number" &&
    typeof totalCount === "number" &&
    totalCount > 1;
  const [isHovered, setIsHovered] = useState(false);
  const alwaysShowControls = useBreakpointValue({ base: true, md: false }) ?? false;
  const controlsVisible = alwaysShowControls || isHovered;

  // Pick a random loading message when loading starts
  const loadingMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
    return LOADING_PHRASES[randomIndex];
  }, [isLoading]); // Re-pick when loading state changes

  const textStyling = {
    fontFamily: "monospace",
    fontSize: "sm",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    color: "gray.800",
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          toaster.create({
            title: "Article copied to clipboard!",
            type: "success",
          });
        })
        .catch((err) => {
          console.error("Failed to copy content: ", err);
        });
    }
  };

  const showButtons = showSignature && (onDelete || content);

  return (
    <>
      <Toaster />
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
            top={3}
            right={3}
            opacity={controlsVisible ? 1 : 0}
            transition="opacity 0.2s ease-in-out"
            gap={1}
          >
            <Tooltip content="Copy article">
              <IconButton
                aria-label="Copy article"
                onClick={handleCopy}
                color="gray.500"
                _hover={{ bg: "blackAlpha.100", color: "gray.800" }}
              >
                <Copy size={16} />
              </IconButton>
            </Tooltip>
            {onDelete && (
              <Tooltip content="Delete article">
                <IconButton
                  aria-label="Delete article"
                  onClick={onDelete}
                  color="gray.500"
                  _hover={{ bg: "red.100", color: "red.600" }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Tooltip>
            )}
          </ButtonGroup>
        )}

        {showPagination && (
          <HStack
            position="absolute"
            top={3}
            left="50%"
            transform="translateX(-50%)"
            justify="center"
            align="center"
            gap={1}
            opacity={controlsVisible ? 1 : 0}
            transition="opacity 0.2s ease-in-out"
            userSelect="none"
            zIndex={1}
          >
            <IconButton
              aria-label="Older article"
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ bg: "blackAlpha.100", color: "gray.800" }}
              onClick={onPrev}
              disabled={currentIndex! >= totalCount! - 1}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <Text fontFamily="monospace" fontSize="xs" color="gray.500">
              {totalCount! - currentIndex!} of {totalCount}
            </Text>
            <IconButton
              aria-label="Newer article"
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ bg: "blackAlpha.100", color: "gray.800" }}
              onClick={onNext}
              disabled={currentIndex! <= 0}
            >
              <ChevronRight size={16} />
            </IconButton>
          </HStack>
        )}

        <Stack direction="column" gap={6}>
          {/* Header section for Buckingham Palace logo */}
          <Box textAlign="center" py={4} position="relative">
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
            {isLoading && !content ? (
              <AnimatedLoadingText text={loadingMessage} />
            ) : isEmpty ? (
              <Stack gap={5}>
                <Text {...textStyling}>{EMPTY_STATE_TITLE}</Text>
                {EMPTY_STATE_PARAGRAPHS.map((paragraph, index) => (
                  <Text key={index} {...textStyling}>
                    {paragraph}
                  </Text>
                ))}
              </Stack>
            ) : (
              <>
                <Text {...textStyling}>{content}</Text>
                {error && (
                  <Text {...textStyling} color="red.500">
                    {error}
                  </Text>
                )}
              </>
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
    </>
  );
}

const PaperHolders = () => {
  // Paper holder triangle styles
  const OFFSET = 1;
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
