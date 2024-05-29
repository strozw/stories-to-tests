
		import { composeStories } from "@storybook/react";
		import { render } from "@testing-library/react";
		import { describe, test } from "vitest";
		import * as stories from "./Page.stories.ts"

		const composedStories = composeStories(stories)

		describe('/Users/s_ohzawa/ghq/github.com/strozw/stories-to-tests/fixtures/react/src/stories/Page.stories.ts', () => {
			test.each(Object.entries(composedStories))("%s", async (_name, Component) => {
				const screen = render(<Component />);

				await Component.play({ canvasElement: screen.container });
			})
		})
	