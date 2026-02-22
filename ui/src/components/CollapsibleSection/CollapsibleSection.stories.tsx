import type { Meta, StoryObj } from "@storybook/react";
import { CollapsibleSection } from "./CollapsibleSection";

const meta: Meta<typeof CollapsibleSection> = {
  title: "Components/CollapsibleSection",
  component: CollapsibleSection,
  decorators: [(Story) => <div style={{ width: 500 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

export const Closed: Story = {
  args: {
    title: "Decisions",
    defaultOpen: false,
    children: "Phase 1: Chose REST over GraphQL for simplicity.",
  },
};

export const Open: Story = {
  args: {
    title: "Decisions",
    defaultOpen: true,
    children: "Phase 1: Chose REST over GraphQL for simplicity.",
  },
};

export const WithRichContent: Story = {
  args: {
    title: "Files & Commits",
    defaultOpen: true,
  },
  render: (args) => (
    <CollapsibleSection {...args}>
      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--ds-border)" }}>
        <div style={{ fontSize: 11, color: "var(--ds-purple)", marginBottom: 4 }}>Phase 1</div>
        <div style={{ whiteSpace: "pre-wrap" }}>
          {"- src/auth/middleware.ts\n- src/auth/session.ts\n- tests/auth.test.ts"}
        </div>
        <span style={{
          fontSize: 11,
          color: "var(--ds-purple)",
          background: "rgba(188, 140, 255, 0.1)",
          padding: "2px 6px",
          borderRadius: 4,
          marginTop: 4,
          display: "inline-block",
        }}>
          abc1234
        </span>
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--ds-purple)", marginBottom: 4 }}>Phase 2</div>
        <div>- src/auth/login.tsx</div>
      </div>
    </CollapsibleSection>
  ),
};
