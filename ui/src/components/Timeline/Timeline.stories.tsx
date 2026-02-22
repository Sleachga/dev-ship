import type { Meta, StoryObj } from "@storybook/react";
import { Timeline } from "./Timeline";

const meta: Meta<typeof Timeline> = {
  title: "Components/Timeline",
  component: Timeline,
  decorators: [(Story) => <div style={{ width: 600 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const samplePhases = [
  { number: 1, label: "Research" },
  { number: 2, label: "Plan" },
  { number: 3, label: "Implement" },
  { number: 4, label: "Demo" },
  { number: 5, label: "Test" },
];

export const AllUpcoming: Story = {
  args: {
    phases: samplePhases,
    phasesComplete: 0,
    currentPhase: 1,
  },
};

export const PartialProgress: Story = {
  args: {
    phases: samplePhases,
    phasesComplete: 2,
    currentPhase: 3,
  },
};

export const AllDone: Story = {
  args: {
    phases: samplePhases,
    phasesComplete: 5,
    currentPhase: null,
  },
};

export const SinglePhase: Story = {
  args: {
    phases: [{ number: 1, label: "Quick fix" }],
    phasesComplete: 0,
    currentPhase: 1,
  },
};

export const ManyPhases: Story = {
  name: "Many Phases (scroll)",
  args: {
    phases: [
      { number: 1, label: "Research" },
      { number: 2, label: "Architecture" },
      { number: 3, label: "Models" },
      { number: 4, label: "API" },
      { number: 5, label: "Frontend" },
      { number: 6, label: "Integration" },
      { number: 7, label: "Testing" },
      { number: 8, label: "Docs" },
    ],
    phasesComplete: 4,
    currentPhase: 5,
  },
};

export const LongNames: Story = {
  name: "Long Phase Names",
  args: {
    phases: [
      { number: 1, label: "Status Effects System" },
      { number: 2, label: "Monster AI & Behavior" },
      { number: 3, label: "Monster Patterns" },
      { number: 4, label: "Monster Abilities" },
      { number: 5, label: "Player Abilities" },
      { number: 6, label: "Weapon Effects" },
      { number: 7, label: "Stance System" },
    ],
    phasesComplete: 6,
    currentPhase: 7,
  },
};

export const Empty: Story = {
  args: {
    phases: [],
    phasesComplete: 0,
    currentPhase: null,
  },
};
