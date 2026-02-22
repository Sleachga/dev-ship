import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = {
  args: { percent: 0, variant: "active", label: "0/5" },
};

export const Partial: Story = {
  args: { percent: 60, variant: "active", label: "3/5" },
};

export const FullActive: Story = {
  args: { percent: 100, variant: "active", label: "5/5" },
};

export const FullDone: Story = {
  args: { percent: 100, variant: "done", label: "5/5" },
};
