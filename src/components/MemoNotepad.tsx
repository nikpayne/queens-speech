import {
  Box,
  Stack,
  Textarea,
  Button,
  Image,
  Collapsible,
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
    <Box
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
            fontFamily="'La Belle Aurore', serif"
            color="gray.800"
            lineHeight="1.5"
            fontSize="lg"
            p={0}
            pt={1}
          />

          {!isLoading && userInput.trim().length > 0 && (
            <Button
              onClick={onGenerate}
              disabled={!userInput.trim() || isLoading}
              borderRadius="sm"
              mt={3}
              w="full"
              fontSize="sm"
              _hover={{
                bg: "#b8960a",
              }}
            >
              Compose royal thoughts
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
