import chalk from "chalk";
import { CreateTestFileResult, DeleteTestDirResult, DeleteTestFileResult } from "./operators.js"

export class CreateFileReporter {

	#result = {
		created: 0,
		override: 0,
		failed: 0,
		time: 0
	}

	printStoriesPath(storiesPath: string) {
		console.log(chalk.blue(storiesPath))
	}

	printAddStoriesPath(storiesRelPath: string) {
		console.log(chalk.bgGreen(chalk.black(' ADD    ')), chalk.blue(storiesRelPath))
	}

	printDeleteStoriesPath(storiesRelPath: string) {
		console.log(chalk.bgRed(chalk.black(' DELETE ')), chalk.blue(storiesRelPath))
	}

	printCreateFilesResults(results: CreateTestFileResult[], { record = true }: { record?: boolean } = {}) {


		results.forEach(({ isExists, isCreated, testFilePath, error }) => {
			if (isExists) {
				if (record) {
					this.#result.override++;
				}

				console.log(chalk.bgYellow(chalk.black(' OVERRIDE ')), testFilePath)
			} else if (isCreated) {
				if (record) {
					this.#result.created++
				}

				console.log('', chalk.green('+'), testFilePath)
			} else if (Boolean(error)) {
				if (record) {
					this.#result.failed++
				}

				console.error(error)
			}
		})
	}

	printDeleteFileResults(results: DeleteTestFileResult[]) {
		results.forEach(({ testFilePath, error }) => {
			if (error) {
				console.error(error)
			} else {
				console.log(chalk.red(' - '), testFilePath)
			}
		})
	}

	printResult() {
		console.log('')

		console.log(
			chalk.green(`Created: ${this.#result.created}`),
			chalk.yellow(`Override: ${this.#result.override}`),
			chalk.red(`Failed: ${this.#result.failed}`),
		)
	}


}
