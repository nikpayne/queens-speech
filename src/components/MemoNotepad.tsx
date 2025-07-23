import {
  Box,
  Stack,
  Textarea,
  Button,
  Image,
  Flex,
  useBreakpointValue,
  Text,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useMemo } from "react";
import { LOADING_PHRASES } from "./constants";

interface AnimatedLoadingTextProps {
  text: string;
}

function AnimatedLoadingText({ text }: AnimatedLoadingTextProps) {
  const slideIn = keyframes`
    from {
      opacity: 0;
      transform: translateX(10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `;

  return (
    <Text
      fontSize="sm"
      color="gray.700"
      fontWeight="bold"
      textAlign="center"
      fontFamily="'Cormorant SC', 'Playfair Display', serif"
      letterSpacing="0.05em"
    >
      {text.split("").map((char, index) => (
        <Box
          key={index}
          as="span"
          display="inline-block"
          opacity={0}
          transform="translateX(1em)"
          css={{
            animation: `${slideIn} 1s ease-out ${index * 0.2}s both`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </Box>
      ))}
    </Text>
  );
}

interface MemoNotepadProps {
  userInput: string;
  onUserInputChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function MemoNotepad({
  userInput,
  onUserInputChange,
  onGenerate,
  isLoading,
}: MemoNotepadProps) {
  // Pick a random loading message when component starts loading
  const loadingMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
    return LOADING_PHRASES[randomIndex];
  }, []); // Re-pick when loading state changes

  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Stack
      bg="white"
      borderRadius="sm"
      boxShadow="md"
      p={6}
      w="100%"
      position="relative"
      transform={!isMobile ? "rotate(-0.2deg) translateY(3px)" : "none"}
      maxW="500px"
      mx="auto"
    >
      <Stack gap={4}>
        <Flex
          justifyContent={isMobile ? "flex-start" : "center"}
          flexDirection="row"
          pt={2}
          pb={4}
          w="100%"
        >
          <Image
            src="/buckingham-palace.svg"
            alt="Buckingham Palace"
            h="60px"
            w="auto"
            objectFit="contain"
          />
        </Flex>

        {/* Notepad Lines and Input */}
        <Box position="relative" zIndex={1}>
          <Textarea
            autoFocus
            placeholder="What is the queen thinking..."
            value={userInput}
            onChange={(e) => onUserInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.metaKey && e.key === "Enter") {
                e.preventDefault();
                if (!isLoading && userInput.trim().length > 0) {
                  onGenerate();
                }
              }
            }}
            rows={isMobile ? 6 : 12}
            autoresize
            maxLength={2000}
            bg="transparent"
            border="none"
            outline="none"
            _focus={{
              boxShadow: "none",
              border: "none",
            }}
            fontFamily="'Homemade Apple', 'Beth Ellen', 'La Belle Aurore', serif"
            _placeholder={{
              color: "gray.400",
            }}
            color="gray.700"
            lineHeight="1.5"
            fontSize="md"
            p={0}
            pt={1}
          />

          <Button
            onClick={onGenerate}
            variant="outline"
            borderRadius="sm"
            w="full"
            fontSize="md"
            // fontFamily="'Beth Ellen', 'La Belle Aurore', serif"
            fontFamily="'Cormorant SC', 'Playfair Display', serif"
            fontWeight="bold"
            bg="blackAlpha.100"
            loading={isLoading}
            disabled={isLoading || !userInput.trim()}
            letterSpacing="0.02em"
          >
            compose royal thoughts
          </Button>

          {isLoading && <AnimatedLoadingText text={loadingMessage} />}
        </Box>
      </Stack>
    </Stack>
  );
}
