import {
  Box,
  Stack,
  Textarea,
  HStack,
  Button,
  Image,
  Flex,
  useBreakpointValue,
  Text,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useMemo, useState } from "react";
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
  const TOTAL_DURATION = 2; // seconds
  const numchars = text.length;
  const durationPerChar = TOTAL_DURATION / numchars;

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
            animation: `${slideIn} ${durationPerChar}s ease-out ${
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
  const [mode, setMode] = useState<"write" | "refine">("write");

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
            rows={isMobile ? 6 : 10}
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

          <HStack w="100%" justifyContent="center" py="4">
            {(["write", "refine"] as const).map((modeOption) => (
              <Box
                key={modeOption}
                position="relative"
                cursor="pointer"
                minW="6em"
                onClick={() => setMode(modeOption)}
              >
                {mode === modeOption && (
                  <Image
                    src="/circle.png"
                    alt="Selected"
                    position="absolute"
                    top="35%"
                    left="45%"
                    transform="translate(-50%, -50%)"
                    w="auto"
                    h="2em"
                    // objectFit="contain"
                    zIndex={0}
                    opacity={0.5}
                  />
                )}
                <Text
                  fontSize="md"
                  fontFamily="'Homemade Apple', 'Beth Ellen', 'La Belle Aurore', serif"
                  textAlign="center"
                  // position="relative"
                  // zIndex={1}
                  color={mode === modeOption ? "gray.800" : "gray.500"}
                  fontWeight={mode === modeOption ? "bold" : "normal"}
                  transition="all 0.2s ease"
                  _hover={{
                    color: "gray.700",
                  }}
                >
                  {modeOption}
                </Text>
              </Box>
            ))}
          </HStack>

          <Button
            onClick={onGenerate}
            variant="solid"
            // bg="blackAlpha.100"
            borderRadius="sm"
            w="full"
            fontSize="lg"
            // fontFamily="'Homemade Apple','Cormorant SC', 'Playfair Display', serif"
            // fontFamily="'Cormorant SC', 'Playfair Display', serif"
            fontFamily="UnifrakturMaguntia"
            // fontWeight="bold"
            loading={isLoading}
            disabled={isLoading || !userInput.trim()}
            // letterSpacing="0.1em"
          >
            Give to the Queen
          </Button>

          {isLoading && <AnimatedLoadingText text={loadingMessage} />}
        </Box>
      </Stack>
    </Stack>
  );
}
