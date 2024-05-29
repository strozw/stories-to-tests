import chalk from "chalk";
import { CreateFileResult } from "./generators.js"

export class CreateFileReporter {


	#result = {
		created: 0,
		override: 0,
		exists: 0,
		failed: 0,
		time: 0
	}

	printCreateFileResult({ isExists, isCreated, testFilePath, error }: CreateFileResult, { record = true }: { record?: boolean } = {}) {
		if (isExists) {
			if (record) {
				this.#result.exists++;
			}

			console.log(chalk.bgBlue(chalk.black(' EXISTS ')), testFilePath)
		} else if (isCreated) {
			if (record) {
				this.#result.created++
			}

			console.log(chalk.bgGreen(chalk.black(' CREATED: ')), testFilePath)
		} else if (Boolean(error)) {
			if (record) {
				this.#result.failed++
			}

			console.log(chalk.bgRed(chalk.black(' FAILED: ')), testFilePath)
		}
	}

	printResult() {
		console.log('')

		console.log(
			chalk.green(`Created: ${this.#result.created}`),
			chalk.blue(`Exists: ${this.#result.exists}`),
			chalk.red(`Failed: ${this.#result.failed}`),
		)
	}
}
