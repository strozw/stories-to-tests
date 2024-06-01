import chokidar from "chokidar";
import { createOutputDirPaht, createStoriesAbsPath, createStoriesRelPath, createTestFiles, deleteTestFiles } from "./operators.js";
import { Config } from "./types.js";
import { glob } from "glob";
import { CreateFileReporter } from "./reporters.js";
import { deleteFileOrDir } from "./utils.js";

export const runClearOuputDir = async (config: Config) => {
	if (!config.outputDir) {
		return
	}

	const outputDirPath = createOutputDirPaht(config)

	const result = await deleteFileOrDir(outputDirPath)

	return result
}

export const runBuild = async (sbMain: { stories: string[] }, config: Config, reporter: CreateFileReporter) => {

	const storiesPaths = await glob(sbMain.stories, { cwd: config.sbConfigPath })

	await Promise.allSettled(storiesPaths.map(async storiesPath => {
		if (!storiesPath.includes('.stories.')) {
			return
		}

		const results = await createTestFiles(storiesPath, config)

		const storiesRelPath = createStoriesRelPath(storiesPath, config)

		reporter.printStoriesPath(storiesRelPath)

		reporter.printCreateFilesResults(results)
	}))

	reporter.printResult()
}

export const runWacth = async (sbMain: { stories: string[] }, config: Config, reporter: CreateFileReporter) => {
	const watcher = chokidar.watch(sbMain.stories, { cwd: config.sbConfigPath });

	watcher.on("ready", () => {
		console.log('')
		console.log("...waiting...");
		console.log('')

		watcher.on("add", async (storiesPath) => {
			const results = await createTestFiles(storiesPath, config)

			const storiesRelPath = createStoriesRelPath(storiesPath, config)

			reporter.printAddStoriesPath(storiesRelPath)

			reporter.printCreateFilesResults(results, { record: false })
		});
	}).on('unlink', async (storiesPath) => {
		const results = await deleteTestFiles(storiesPath, config)

		const storiesRelPath = createStoriesRelPath(storiesPath, config)

		reporter.printDeleteStoriesPath(storiesRelPath)

		reporter.printDeleteFileResults(results)
	});
}
