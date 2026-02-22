import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Active: Story = {
  args: { status: "active" },
};

export const Complete: Story = {
  args: { status: "complete" },
};
