import chokidar from "chokidar";
import { createTestFile } from "./generators.js";
import { Config } from "./types.js";
import { glob } from "glob";
import { CreateFileReporter } from "./reporters.js";

export const runBuild = async (sbMain: { stories: string[] }, config: Config, reporter: CreateFileReporter) => {

	const storiesPaths = await glob(sbMain.stories, { cwd: config.sbConfigPath })

	await Promise.allSettled(storiesPaths.map(async storiesPath => {
		if (!storiesPath.includes('.stories.')) {
			return
		}

		const result = await createTestFile(storiesPath, config)

		reporter.printCreateFileResult(result)
	}))

	reporter.printResult()
}


export const runWacth = async (sbMain: { stories: string[] }, config: Config, reporter: CreateFileReporter) => {
	const watcher = chokidar.watch(sbMain.stories, { cwd: config.sbConfigPath });

	watcher.on("ready", () => {
		console.log("...waiting...");

		watcher.on("add", async (storiesPath: string) => {
			console.log(storiesPath)

			const result = await createTestFile(storiesPath, config)

			reporter.printCreateFileResult(result, { record: false })
		});
	});
}
