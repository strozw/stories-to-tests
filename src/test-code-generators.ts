
export const generateViteReactStoriesTestCode = (
	{
		importStoriesPath,
		testSuiteName
	}: {
		importStoriesPath: string,
		testSuiteName: string
	}) => {
	const code = `
		import { composeStories } from "@storybook/react";
		import { render } from "@testing-library/react";
		import { describe, test } from "vitest";
		import * as stories from "${importStoriesPath}"

		const composedStories = composeStories(stories)

		describe('${testSuiteName}', () => {
			test.each(Object.entries(composedStories))("%s", async (_name, Component) => {
				const screen = render(<Component />);

				await Component.play({ canvasElement: screen.container });
			})
		})
	`
	return code
}

