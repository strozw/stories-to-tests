import chalk from "chalk";
import chokidar from "chokidar";
import { createTestFile } from "./test-file-creators.js";
import { Config } from "./types.js";
import { glob } from "glob";

export const runBuild = async (sbMain: { stories: string[] }, config: Config) => {
	const result = {
		created: 0,
		override: 0,
		exists: 0,
		failed: 0,
		time: 0
	}

	const storiesPaths = await glob(sbMain.stories, { cwd: config.sbConfigPath })

	await Promise.allSettled(storiesPaths.map(async storiesPath => {
		if (!storiesPath.includes('.stories.')) {
			return
		}

		const { testFilePath, isExists, isCreated, error } = await createTestFile(storiesPath, config)

		if (isExists) {
			result.exists++;

			console.log(chalk.bgBlue(chalk.black(' EXISTS ')), testFilePath)
		} else if (isCreated) {
			result.created++

			console.log(chalk.bgGreen(chalk.black(' CREATED: ')), testFilePath)
		} else if (Boolean(error)) {
			result.failed++

			console.log(chalk.bgRed(chalk.black(' FAILED: ')), testFilePath)
		}
	}))

	console.log('')

	console.log(
		chalk.green(`Created: ${result.created}`),
		chalk.blue(`Exists: ${result.exists}`),
		chalk.red(`Failed: ${result.failed}`),
	)
}


export const runWacth = async (sbMain: { stories: string[] }, config: Config) => {

	const watcher = chokidar.watch(sbMain.stories, { cwd: config.sbConfigPath });

	watcher.on("ready", () => {
		console.log("...waiting...");

		watcher.on("add", async (storiesPath: string) => {
			console.log(storiesPath)

			const { testFilePath, isExists, isCreated, error } = await createTestFile(storiesPath, config)

			if (isExists) {
				console.log(chalk.bgBlue(chalk.black(' EXISTS ')), testFilePath)
			} else if (isCreated) {
				console.log(chalk.bgGreen(chalk.black(' CREATED: ')), testFilePath)
			} else if (Boolean(error)) {
				console.log(chalk.bgRed(chalk.black(' FAILED: ')), testFilePath)
			}
		});
	});
}
