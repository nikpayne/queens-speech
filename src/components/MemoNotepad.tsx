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
import React from "react";
import type { GenerationMode } from "@/lib/generator";

interface MemoNotepadProps {
  userInput: string;
  mode: GenerationMode;
  onUserInputChange: (value: string) => void;
  onModeChange: (mode: GenerationMode) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function MemoNotepad({
  userInput,
  mode,
  onUserInputChange,
  onModeChange,
  onGenerate,
  isLoading,
}: MemoNotepadProps) {
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
                onClick={() => onModeChange(modeOption)}
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
        </Box>
      </Stack>
    </Stack>
  );
}
