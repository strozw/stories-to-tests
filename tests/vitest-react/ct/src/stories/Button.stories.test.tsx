import { composeStories, setProjectAnnotations } from "@storybook/react";
import { render } from "@testing-library/react";
import { describe, test } from "vitest";
import * as globalStorybookConfig from "/Users/s_ohzawa/ghq/github.com/strozw/stories-to-tests/tests/vitest-react/.storybook/preview";
import * as stories from "./../../../src/stories/Button.stories.ts";

setProjectAnnotations(globalStorybookConfig);

const composedStories = composeStories(stories);

describe("/src/stories/Button.stories.ts", () => {
  test.each(Object.entries(composedStories))("%s", async (_name, Component) => {
    const screen = render(<Component />);

    if ("play" in Component && typeof Component.play === "function") {
      await Component?.play({ canvasElement: screen.container });
    }
  });
});
