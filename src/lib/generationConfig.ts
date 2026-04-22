export const DEFAULT_SAMPLE_COUNT = 2;
export const MAX_SAMPLE_COUNT = 10;
export const GENERATION_TEMPERATURE = 0.8;
export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 1;

export type ModelTier = "cheap" | "fancy";

export const MODEL_BY_TIER: Record<ModelTier, string> = {
  cheap: "claude-haiku-4-5",
  fancy: "claude-sonnet-4-5",
};

export const DEFAULT_MODEL_TIER: ModelTier = "fancy";
