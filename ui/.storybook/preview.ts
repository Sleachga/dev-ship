import type { Preview } from "@storybook/react";
import "../src/tokens/tokens.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "terminal",
      values: [
        { name: "terminal", value: "#0d1117" },
        { name: "surface", value: "#161b22" },
      ],
    },
    layout: "centered",
  },
};

export default preview;
