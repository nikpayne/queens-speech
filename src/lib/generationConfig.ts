export const DEFAULT_SAMPLE_COUNT = 1;
export const MAX_SAMPLE_COUNT = 10;

export type ModelTier = "cheap" | "fancy";

export const MODEL_BY_TIER: Record<ModelTier, string> = {
  cheap: "claude-haiku-4-5",
  fancy: "claude-sonnet-4-5",
};

export const DEFAULT_MODEL_TIER: ModelTier = "cheap";
