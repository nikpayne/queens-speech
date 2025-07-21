import {
  Box,
  Stack,
  Textarea,
  Button,
  Image,
  Presence,
} from "@chakra-ui/react";

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
  return (
    <Stack
      bg="white"
      borderRadius="sm"
      boxShadow="md"
      p={6}
      minW="320px"
      maxW="320px"
      minH="500px"
      position="relative"
      transform="rotate(-0.5deg) translateY(2px)"
    >
      <Stack gap={4}>
        <Box textAlign="center" pt={2} pb={4} position="relative" zIndex={1}>
          <Image
            src="/buckingham-palace.svg"
            alt="Buckingham Palace"
            h="60px"
            w="auto"
            mx="auto"
            objectFit="contain"
          />
        </Box>

        {/* Notepad Lines and Input */}
        <Box position="relative" zIndex={1}>
          <Textarea
            placeholder="What is the queen thinking..."
            value={userInput}
            onChange={(e) => onUserInputChange(e.target.value)}
            rows={12}
            resize="none"
            maxLength={2000}
            bg="transparent"
            border="none"
            outline="none"
            _focus={{
              boxShadow: "none",
              border: "none",
            }}
            fontFamily="'Beth Ellen', 'La Belle Aurore', serif"
            _placeholder={{
              color: "gray.400",
            }}
            color="gray.700"
            lineHeight="1.5"
            fontSize="md"
            p={0}
            pt={1}
          />

          <Presence
            present={!isLoading && userInput.trim().length > 0}
            animationName={{
              _open: "scale-fade-in",
              _closed: "scale-fade-out",
            }}
            animationDuration="moderate"
          >
            <Button
              onClick={onGenerate}
              variant="outline"
              borderRadius="sm"
              w="full"
              fontSize="sm"
            >
              Compose royal thoughts
            </Button>
          </Presence>
        </Box>
      </Stack>
    </Stack>
  );
}
