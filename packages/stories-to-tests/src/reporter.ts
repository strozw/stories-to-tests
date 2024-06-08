import chalk from "chalk";
import type {
  CreateTestFileResult,
  DeleteTestFileResult,
} from "./operators.js";
import { isErrorResult } from "./utils.js";

export class Reporter {
  #result = {
    created: 0,
    override: 0,
    failed: 0,
    time: 0,
  };

  printStoriesPath(storiesPath: string) {
    console.log(chalk.blue('Ref:'), chalk.blue(storiesPath));
  }

  printAddStoriesPath(storiesRelPath: string) {
    console.log(
      chalk.bgGreen(chalk.black(" ADD    ")),
      chalk.blue(storiesRelPath),
    );
  }

  printDeleteStoriesPath(storiesRelPath: string) {
    console.log(
      chalk.bgRed(chalk.black(" DELETE ")),
      chalk.blue(storiesRelPath),
    );
  }

  printCreateFilesResults(
    results: CreateTestFileResult[],
    { record = true }: { record?: boolean } = {},
  ) {
    for (const result of results) {
      if (isErrorResult(result)) {
        if (record) {
          this.#result.failed++;
        }

        console.error(result.error);
        return
      }

      const { testFilePath, isExists, isCreated } = result.value

      if (isExists) {
        if (record) {
          this.#result.override++;
        }

        console.log(chalk.bgYellow(chalk.black(" OVERRIDE ")), testFilePath);
      } else if (isCreated) {
        if (record) {
          this.#result.created++;
        }

        console.log("", chalk.green("+"), testFilePath);
      }
    }
  }

  printDeleteFileResults(results: DeleteTestFileResult[]) {
    for (const result of results) {
      if (isErrorResult(result)) {
        console.error(result.error);
      } else {
        console.log(chalk.red(" -"), result.value.testFilePath);
      }
    }
  }

  printResult() {
    console.log("");

    console.log(
      chalk.green(`Created: ${this.#result.created}`),
      chalk.yellow(`Override: ${this.#result.override}`),
      chalk.red(`Failed: ${this.#result.failed}`),
    );
  }

  printDeletedOutputDir(ouputDir: string) {
    console.log(chalk.blue("Reset OutputDir"));
    console.log(chalk.red(" -"), ouputDir);
  }
}
