import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionStatus } from "./ConnectionStatus";

const meta: Meta<typeof ConnectionStatus> = {
  title: "Components/ConnectionStatus",
  component: ConnectionStatus,
};

export default meta;
type Story = StoryObj<typeof ConnectionStatus>;

export const Connected: Story = {
  args: { state: "connected" },
};

export const Disconnected: Story = {
  args: { state: "disconnected" },
};

export const Connecting: Story = {
  args: { state: "connecting" },
};
