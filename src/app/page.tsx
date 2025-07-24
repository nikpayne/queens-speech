"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Image,
  Container,
  Stack,
  Text,
  HStack,
  Flex,
  Grid,
  GridItem,
  useBreakpointValue,
  Button,
  IconButton,
} from "@chakra-ui/react";
import DesktopWindow from "@/components/DesktopWindow";
import MemoNotepad from "@/components/MemoNotepad";
import ArticleStationary from "@/components/ArticleStationary";
import {
  getGenerationHistory,
  deleteGeneration,
  GenerationHistory,
} from "@/lib/storage";
import type { GenerationMode } from "@/lib/generator";
import { useGeneration } from "@/hooks/useGeneration";

import QueensPhone from "@/components/QueensPhone";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [mode, setMode] = useState<GenerationMode>("write");
  const [generationHistory, setGenerationHistory] = useState<
    GenerationHistory[]
  >([]);

  // Use the generation hook
  const {
    handleGenerate,
    result,
    isLoading,
    streamingContent,
    streamingTitle,
  } = useGeneration({
    onGenerationSaved: () => {
      // Update generation history when a generation is saved
      const updatedHistory = getGenerationHistory();
      setGenerationHistory(updatedHistory);
    },
  });

  useEffect(() => {
    const history = getGenerationHistory();
    setGenerationHistory(history);
  }, []);

  const handleDelete = (id: string) => {
    deleteGeneration(id);
    const updatedHistory = getGenerationHistory();
    setGenerationHistory(updatedHistory);
  };

  const handleCopy = () => {
    console.log("Article copied to clipboard");
  };

  const handleLogLocalStorage = () => {
    const history = getGenerationHistory();
    console.log("=== LOCALSTORAGE DEBUG ===");
    console.log("Total generations:", history.length);
    console.log("Generation history:", history);
    console.log(
      "Raw localStorage data:",
      localStorage.getItem("queens-speech-history")
    );
    console.log("========================");
  };

  const success = result && result.success;
  const articleContent = success
    ? result.article || ""
    : streamingContent || "";
  const articleTitle = success ? result.title || "" : streamingTitle || "";
  const showSignature = Boolean(success && !isLoading && !streamingContent);

  const penImage = useBreakpointValue({
    base: "/fountain-pen-rotated.png",
    lg: "/fountain-pen.png",
  });

  return (
    <Box
      minH="100vh"
      bgImage="url('https://media1.thehungryjpeg.com/thumbs2/ori_112089_038b9609023e963d7cc9d48242cb5541e9d03ff5_20-dark-wood-background-textures.jpg')"
      bgAttachment="fixed"
      bgSize="cover"
      bgRepeat="no-repeat"
      position="relative"
    >
      {/* Debug button - top right corner */}
      <Button
        position="fixed"
        top="4"
        right="4"
        size="sm"
        colorScheme="gray"
        variant="solid"
        onClick={handleLogLocalStorage}
        zIndex="1000"
        bg="blackAlpha.700"
        color="white"
        _hover={{ bg: "blackAlpha.800" }}
      >
        Debug Storage
      </Button>
      <Grid
        gridTemplateAreas={{
          base: `
          "pen"
          "notepad"
          "article"
          "other"
        `,
          lg: `
          "pen notepad article other other"
        `,
        }}
        gridTemplateColumns={{
          base: `1fr`,
          lg: `40px 2fr 4.5fr 2fr 40px`,
        }}
        maxW="8xl"
        mx="auto"
        py="8"
        gap="6"
        px="4"
      >
        <GridItem
          area="pen"
          // maxH={{ base: "40px", lg: "none" }}
          // display="flex"
          justifyContent="center"
        >
          <Image
            src={penImage}
            alt="Fountain Pen"
            // maxW={{ base: undefined, lg: "40px" }}
            maxH={{ base: "40px", lg: "100%" }}
            // maxW="100%"
            position="relative"
            mx="auto"
          />
        </GridItem>
        <GridItem area="notepad" position="relative">
          {/* I want box to be sticky */}
          <Box>
            <MemoNotepad
              userInput={userInput}
              mode={mode}
              onUserInputChange={setUserInput}
              onModeChange={setMode}
              onGenerate={() => handleGenerate(userInput, mode)}
              isLoading={isLoading}
            />
          </Box>
        </GridItem>
        <GridItem area="article">
          <Stack>
            <ArticleStationary
              content={articleContent}
              title={articleTitle}
              showSignature={showSignature}
              showPaperHolders={true}
              isLoading={isLoading}
              error={result?.error}
            />
            {generationHistory.length > 0 &&
              !isLoading &&
              !streamingContent && (
                <Stack gap={6} mt={8}>
                  {(result
                    ? generationHistory.slice(1)
                    : generationHistory
                  ).map((generation) => (
                    <ArticleStationary
                      key={generation.id}
                      content={generation.content}
                      title={generation.title}
                      showSignature={true}
                      onDelete={() => handleDelete(generation.id)}
                      onCopy={handleCopy}
                    />
                  ))}
                </Stack>
              )}
          </Stack>
        </GridItem>
        <GridItem area="other">
          <QueensPhone />
        </GridItem>
      </Grid>
    </Box>
  );
}
