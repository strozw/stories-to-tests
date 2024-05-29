
		import { composeStories } from "@storybook/react";
		import { render } from "@testing-library/react";
		import { describe, test } from "vitest";
		import * as stories from "./Button.stories.ts"

		const composedStories = composeStories(stories)

		describe('/fixtures/react/src/stories/Button.stories.ts', () => {
			test.each(Object.entries(composedStories))("%s", async (_name, Component) => {
				const screen = render(<Component />);

				if ('play' in Component && typeof Component.play === 'function') {
					await Component?.play({ canvasElement: screen.container });
				}
			})
		})
	