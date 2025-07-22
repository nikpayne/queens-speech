import {
  Box,
  Stack,
  Textarea,
  Button,
  Image,
  Presence,
} from "@chakra-ui/react";
import { useMemo } from "react";

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
  }, [isLoading]); // Re-pick when loading state changes

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
            onKeyDown={(e) => {
              if (e.metaKey && e.key === "Enter") {
                e.preventDefault();
                if (!isLoading && userInput.trim().length > 0) {
                  onGenerate();
                }
              }
            }}
            rows={12}
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

          <Presence
            present={isLoading || userInput.trim().length > 0}
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
              fontFamily="'Beth Ellen', 'La Belle Aurore', serif"
              bg="blackAlpha.100"
              loading={isLoading}
              disabled={isLoading || userInput.trim().length === 0}
              loadingText={loadingMessage}
            >
              Compose royal thoughts
            </Button>
          </Presence>
        </Box>
      </Stack>
    </Stack>
  );
}

const LOADING_PHRASES = [
  "thinkimg...",
  "bloggin in",
  "computering",
  "writyng",
  "procesiing thoughnt",
  "cramfting wrdos",
  "brain workign",
  "typyng away",
  "composering",
  "wordsmithing",
  "creafting blogg",
  "assemblyng thoughnt",
  "writyng magesty",
  "bloggin royaly",
  "computler thinkimg",
  "crafyng sentance",
  "processyng wrdos",
  "royaly typyng",
  "bloggin awya",
  "finishyng upp",
  "assemblyng the wrdos togethre",
  "cramfting",
  "royaly processyng blogg contrent",
  "thinkimg very hardley",
  "writyng upp storys",
  "computler wokring magicaly",
  "bloggin",
  "creafting delightfull sentances",
  "processyng",
  "typyng away furiosly",
  "computering the thoughnts",
  "writyng royaly magnificennt bloggs",
  "bloggin magesty",
  "assemblyng wrdos into sentances",
  "creafting",
  "royaly thinkimg aboutt thingss",
  "computler processyng wrdos",
  "writyng upp delightfull contrent",
  "bloggin away magnificentlty",
  "finishyng upp the writyng",
];
