import chalk from "chalk";
import { CreateFileResult } from "./generators.js"

export class CreateFileReporter {
	#result = {
		created: 0,
		override: 0,
		failed: 0,
		time: 0
	}

	printCreateFileResult({ isExists, isCreated, testFilePath, error }: CreateFileResult, { record = true }: { record?: boolean } = {}) {
		if (isExists) {
			if (record) {
				this.#result.override++;
			}

			console.log(chalk.bgYellow(chalk.black(' OVERRIDE ')), testFilePath)
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
			chalk.yellow(`Override: ${this.#result.override}`),
			chalk.red(`Failed: ${this.#result.failed}`),
		)
	}
}
