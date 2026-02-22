export type FeatureStatus = "in-progress" | "complete";

export type SubStep = "context" | "implement" | "summarize";

export interface Feature {
  dir: string;
  name?: string;
  ticket?: string;
  status?: string;
  step?: string;
  started?: string;
  phasesComplete?: number;
  phasesTotal?: number | null;
}

export interface Phase {
  number: number;
  context?: string;
  summary?: string;
}

export interface FeatureDetail extends Feature {
  plan?: string;
  phases: Phase[];
}
