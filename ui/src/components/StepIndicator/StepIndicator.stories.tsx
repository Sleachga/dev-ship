import type { Meta, StoryObj } from "@storybook/react";
import { StepIndicator } from "./StepIndicator";

const meta: Meta<typeof StepIndicator> = {
  title: "Components/StepIndicator",
  component: StepIndicator,
};

export default meta;
type Story = StoryObj<typeof StepIndicator>;

export const ContextActive: Story = {
  args: { currentPhase: 2, activeSubStep: "context" },
};

export const ImplementActive: Story = {
  args: { currentPhase: 2, activeSubStep: "implement" },
};

export const SummarizeActive: Story = {
  args: { currentPhase: 3, activeSubStep: "summarize" },
};

export const AllComplete: Story = {
  args: { currentPhase: null, isComplete: true },
};

export const CustomStep: Story = {
  args: { currentPhase: null, customStep: "research" },
};
