"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Image,
  Stack,
  Flex,
  Grid,
  GridItem,
  useBreakpointValue,
} from "@chakra-ui/react";
import MemoNotepad from "@/components/MemoNotepad";
import ArticleStationary from "@/components/ArticleStationary";
import {
  getGenerationHistory,
  deleteGeneration,
  clearGenerationHistory,
  GenerationHistory,
} from "@/lib/storage";
import type { GenerationMode } from "@/lib/generator";
import { useGeneration } from "@/hooks/useGeneration";

import QueensPhone from "@/components/QueensPhone";
import AboutModal from "@/components/AboutModal";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [mode, setMode] = useState<GenerationMode>("write");
  const [generationHistory, setGenerationHistory] = useState<
    GenerationHistory[]
  >([]);
  // Index into `generationHistory` of the article currently shown in the
  // single notepad. 0 is the most recent generation.
  const [historyIndex, setHistoryIndex] = useState(0);

  // Use the generation hook
  const {
    handleGenerate,
    result,
    isLoading,
    streamingContent,
    streamingTitle,
  } = useGeneration({
    onGenerationSaved: () => {
      // A new generation was just saved → jump back to the latest entry.
      const updatedHistory = getGenerationHistory();
      setGenerationHistory(updatedHistory);
      setHistoryIndex(0);
    },
  });

  useEffect(() => {
    const history = getGenerationHistory();
    setGenerationHistory(history);
  }, []);

  const handleDeleteCurrent = () => {
    const current = generationHistory[historyIndex];
    if (!current) return;
    deleteGeneration(current.id);
    const updatedHistory = getGenerationHistory();
    setGenerationHistory(updatedHistory);
    setHistoryIndex((idx) =>
      Math.min(idx, Math.max(0, updatedHistory.length - 1))
    );
  };

  const handlePrev = () => {
    setHistoryIndex((idx) => Math.min(idx + 1, generationHistory.length - 1));
  };

  const handleNext = () => {
    setHistoryIndex((idx) => Math.max(idx - 1, 0));
  };

  const handleCopy = () => {
    console.log("Article copied to clipboard");
  };

  // Expose `debug()` and `reset()` helpers on `window` so localStorage can be
  // inspected and cleared from the browser console without any visible UI.
  useEffect(() => {
    const debug = () => {
      const history = getGenerationHistory();
      console.log("=== LOCALSTORAGE DEBUG ===");
      console.log("Total generations:", history.length);
      console.log("Generation history:", history);
      console.log(
        "Raw localStorage data:",
        localStorage.getItem("queens-speech-history")
      );
      console.log("========================");
      return history;
    };
    const reset = () => {
      clearGenerationHistory();
      setGenerationHistory([]);
      setHistoryIndex(0);
      console.log("Generation history cleared.");
    };
    const w = window as unknown as { debug: typeof debug; reset: typeof reset };
    w.debug = debug;
    w.reset = reset;
    return () => {
      delete (window as unknown as { debug?: typeof debug }).debug;
      delete (window as unknown as { reset?: typeof reset }).reset;
    };
  }, []);

  // While a generation is streaming we show the live partial content. Once it
  // finishes (or whenever the user is just browsing), we show the entry from
  // history at `historyIndex`. The single notepad holds everything.
  const isStreaming = isLoading || Boolean(streamingContent);
  const safeHistoryIndex = Math.min(
    historyIndex,
    Math.max(0, generationHistory.length - 1)
  );
  const currentEntry: GenerationHistory | undefined =
    generationHistory[safeHistoryIndex];

  const articleContent = isStreaming
    ? streamingContent || ""
    : currentEntry?.content || "";
  const articleTitle = isStreaming
    ? streamingTitle || ""
    : currentEntry?.title || "";
  const showSignature = !isStreaming && Boolean(currentEntry);
  const isEmpty =
    !isStreaming &&
    !result?.error &&
    generationHistory.length === 0;

  const penImage = useBreakpointValue({
    base: "/fountain-pen-rotated.png",
    lg: "/fountain-pen.png",
  });

  return (
    <Box
      minH="100vh"
      bgImage="url('/wood-background.png')"
      bgAttachment="fixed"
      bgSize="cover"
      bgRepeat="no-repeat"
      position="relative"
    >
      <Grid
        gridTemplateAreas={{
          base: `
          "pen"
          "notepad"
          "article"
          "phone"
        `,
          lg: `
          "pen notepad article phone ."
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
        <GridItem area="pen" pt={{ base: undefined, lg: "10vh" }}>
          <Box transform={{ base: undefined, lg: "rotate(-0.4deg)" }}>
            <Image
              src={penImage}
              alt="Fountain Pen"
              maxH={{ base: "40px", lg: "100%" }}
              position="relative"
              mx="auto"
              filter="brightness(0.9) drop-shadow(0 0 10px rgba(0, 0, 0, 0.4))"
            />
          </Box>
        </GridItem>
        <GridItem
          area="notepad"
          position="relative"
          pt={{ base: undefined, lg: "12vh" }}
        >
          {/* I want box to be sticky */}
          <Box
            transform={{
              base: undefined,
              lg: "rotate(-0.3deg) translateY(3px)",
            }}
          >
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
        <GridItem area="phone" pt={{ base: undefined, lg: "10vh" }}>
          <Flex
            transform={{ base: undefined, lg: "rotate(0.5deg)" }}
            justifyContent="center"
            alignItems="center"
          >
            <QueensPhone />
          </Flex>
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
              isEmpty={isEmpty}
              onDelete={
                !isStreaming && currentEntry ? handleDeleteCurrent : undefined
              }
              currentIndex={
                !isStreaming && generationHistory.length > 0
                  ? safeHistoryIndex
                  : undefined
              }
              totalCount={
                !isStreaming ? generationHistory.length : undefined
              }
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </Stack>
        </GridItem>
      </Grid>
      <AboutModal />
    </Box>
  );
}
