import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { Feature } from "../../types/feature";
import { FeatureTable } from "./FeatureTable";

const meta: Meta<typeof FeatureTable> = {
  title: "Components/FeatureTable",
  component: FeatureTable,
  decorators: [(Story) => <div style={{ width: 800 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof FeatureTable>;

const sampleFeatures: Feature[] = [
  {
    dir: "auth-system",
    name: "Authentication System",
    ticket: "PROJ-123",
    status: "in-progress",
    step: "phase-2:implement",
    phasesComplete: 1,
    phasesTotal: 4,
  },
  {
    dir: "live-dashboard",
    name: "Live Dashboard",
    ticket: "PROJ-98",
    status: "complete",
    step: "complete",
    phasesComplete: 3,
    phasesTotal: 3,
  },
  {
    dir: "search-feature",
    name: "Search Feature",
    step: "phase-1:context",
    phasesComplete: 0,
    phasesTotal: 5,
  },
];

export const MultipleFeatures: Story = {
  args: {
    features: sampleFeatures,
    onFeatureClick: fn(),
  },
};

export const SingleFeature: Story = {
  args: {
    features: [sampleFeatures[0]],
    onFeatureClick: fn(),
  },
};

export const EmptyState: Story = {
  args: {
    features: [],
    onFeatureClick: fn(),
  },
};

export const ClickableRows: Story = {
  args: {
    features: sampleFeatures,
    onFeatureClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Click a row to trigger onFeatureClick with the feature dir. Check the Actions panel.",
      },
    },
  },
};
