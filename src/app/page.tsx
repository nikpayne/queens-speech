"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  DEFAULT_MODEL_TIER,
  DEFAULT_SAMPLE_COUNT,
  GENERATION_TEMPERATURE,
  MAX_TEMPERATURE,
  MAX_SAMPLE_COUNT,
  MIN_TEMPERATURE,
  MODEL_BY_TIER,
  type ModelTier,
} from "@/lib/generationConfig";

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
  // Runtime-only setting (not persisted): how many reference samples to send.
  const [sampleCount, setSampleCount] = useState(DEFAULT_SAMPLE_COUNT);
  // Runtime-only setting (not persisted): choose cheap vs fancy model tier.
  const [modelTier, setModelTier] = useState<ModelTier>(DEFAULT_MODEL_TIER);
  const [temperature, setTemperature] = useState(GENERATION_TEMPERATURE);
  const hasShownConsoleHelp = useRef(false);

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
    const samples = (count: number) => {
      if (!Number.isInteger(count) || count < 1 || count > MAX_SAMPLE_COUNT) {
        console.warn(
          `samples(n): n must be an integer between 1 and ${MAX_SAMPLE_COUNT}`
        );
        return sampleCount;
      }
      setSampleCount(count);
      console.log(`sampleCount updated to ${count}`);
      return count;
    };
    const model = (tier: ModelTier) => {
      if (tier !== "cheap" && tier !== "fancy") {
        console.warn('model(tier): tier must be "cheap" or "fancy"');
        return modelTier;
      }
      setModelTier(tier);
      console.log(`model tier updated to ${tier} (${MODEL_BY_TIER[tier]})`);
      return tier;
    };
    const temp = (value: number) => {
      if (
        typeof value !== "number" ||
        Number.isNaN(value) ||
        value < MIN_TEMPERATURE ||
        value > MAX_TEMPERATURE
      ) {
        console.warn(
          `temp(n): n must be a number between ${MIN_TEMPERATURE} and ${MAX_TEMPERATURE}`
        );
        return temperature;
      }
      setTemperature(value);
      console.log(`temperature updated to ${value}`);
      return value;
    };
    const showConsoleHelp = () => {
      console.log(
        `\n=== QUEEN'S SPEECH CONSOLE COMMANDS ===\n` +
          `debug()   -> log saved history/localStorage\n` +
          `reset()   -> clear generation history\n` +
          `samples(n)-> set few-shot sample count (1-${MAX_SAMPLE_COUNT})\n\n` +
          `model(t)  -> set model tier: "cheap" | "fancy"\n\n` +
          `temp(n)   -> set temperature (${MIN_TEMPERATURE}-${MAX_TEMPERATURE})\n\n` +
          `Current settings:\n` +
          `modelTier=${modelTier}\n` +
          `model=${MODEL_BY_TIER[modelTier]}\n` +
          `sampleCount=${sampleCount}\n` +
          `temperature=${temperature}\n` +
          `======================================\n`
      );
    };
    
    const w = window as unknown as {
      debug: typeof debug;
      reset: typeof reset;
      samples: typeof samples;
      model: typeof model;
      temp: typeof temp;
      commands: typeof showConsoleHelp;
    };
    w.debug = debug;
    w.reset = reset;
    w.samples = samples;
    w.model = model;
    w.temp = temp;
    w.commands = showConsoleHelp;
    // Show discoverability/help once on first load.
    if (!hasShownConsoleHelp.current) {
      showConsoleHelp();
      hasShownConsoleHelp.current = true;
    }
    return () => {
      delete (window as unknown as { debug?: typeof debug }).debug;
      delete (window as unknown as { reset?: typeof reset }).reset;
      delete (window as unknown as { samples?: typeof samples }).samples;
      delete (window as unknown as { model?: typeof model }).model;
      delete (window as unknown as { temp?: typeof temp }).temp;
      delete (window as unknown as { commands?: typeof showConsoleHelp }).commands;
    };
  }, [sampleCount, modelTier, temperature]);

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
              onGenerate={() => {
                // Start every run from the newest slot so we don't keep a stale
                // "viewing older history" index while new content is generated.
                setHistoryIndex(0);
                handleGenerate(
                  userInput,
                  mode,
                  sampleCount,
                  modelTier,
                  temperature
                );
              }}
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
