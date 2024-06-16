import colorette from "colorette";
import * as v from "valibot";
import type {
  CreateTestFileResult,
  DeleteTestFileResult,
} from "./operators.js";
import type { ParseResultIssues } from "./options.js";
import { isErrorResult } from "./utils.js";

export class Reporter {
  printParseOptionsError(issues: ParseResultIssues) {
    for (const issue of issues) {
      if (issue.issues) {
        console.error(v.flatten(issue.issues));
      }
    }
  }
  #result = {
    created: 0,
    override: 0,
    failed: 0,
    time: 0,
  };

  printPathNotExists(targetPath: string) {
    console.log(colorette.red(`Error: "${targetPath}" is not exists.`));
  }

  printStoriesPath(storiesPath: string) {
    console.log(colorette.blue("Ref:"), colorette.blue(storiesPath));
  }

  printAddStoriesPath(storiesRelPath: string) {
    console.log(
      colorette.bgGreen(colorette.black(" ADD    ")),
      colorette.blue(storiesRelPath),
    );
  }

  printDeleteStoriesPath(storiesRelPath: string) {
    console.log(
      colorette.bgRed(colorette.black(" DELETE ")),
      colorette.blue(storiesRelPath),
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
        return;
      }

      const { testFilePath, isExists, isCreated } = result.value;

      if (isExists) {
        if (record) {
          this.#result.override++;
        }

        console.log(
          colorette.bgYellow(colorette.black(" OVERRIDE ")),
          testFilePath,
        );
      } else if (isCreated) {
        if (record) {
          this.#result.created++;
        }

        console.log("", colorette.green("+"), testFilePath);
      }
    }
  }

  printDeleteFileResults(results: DeleteTestFileResult[]) {
    for (const result of results) {
      if (isErrorResult(result)) {
        console.error(result.error);
      } else {
        console.log(colorette.red(" -"), result.value.testFilePath);
      }
    }
  }

  printResult() {
    console.log("");

    console.log(
      colorette.green(`Created: ${this.#result.created}`),
      colorette.yellow(`Override: ${this.#result.override}`),
      colorette.red(`Failed: ${this.#result.failed}`),
    );
  }

  printDeletedOutputDir(ouputDir: string) {
    console.log(colorette.blue("Reset OutputDir"));
    console.log(colorette.red(" -"), ouputDir);
  }
}
