import {
  Box,
  Stack,
  Textarea,
  Button,
  Image,
  Flex,
  useBreakpointValue,
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
  }, []); // Re-pick when loading state changes

  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Stack
      bg="white"
      borderRadius="sm"
      boxShadow="md"
      p={6}
      w="100%"
      minH={isMobile ? "300px" : "500px"}
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
            loadingText={loadingMessage}
          >
            compose royal thoughts
          </Button>
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
