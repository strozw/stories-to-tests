#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import { Reporter } from "./reporter.js";
import { runBuild, runClearOutputDir, runWacth } from "./runners.js";
import { defineConfig, type Config } from "./config.js";
import { getStorybookMain, isExistsPath } from "./utils.js";
import { parseOptions } from "./options.js";

const program = new Command();

program
  .name("stories-to-tests")
  .description("generate stories tests files from `.stories.tsx`")
  .version("0.0.1")
  .option("-c --config <path>", "`.storybook` config dir path")
  .option(
    "-t --template-type <template-type>",
    "template type. but now `vitest-react` only",
  )
  .option("--template-dir <template-dir-path>", "custom template directory.")
  .option(
    "-o --output-dir <path>",
    "test files ouput directory path. if not set, test code will be generated next to stories filed.",
  )
  .option(
    "-w --watch",
    "watch target stories paths. if add or delete stories file, realted test code will be generated or deleted.",
  )
  .action(async (options) => {
    const reporter = new Reporter();

    const paraseResult = parseOptions(options);

    if (!paraseResult.success) {
      reporter.printParseOptionsError(paraseResult.issues)

      return process.exit(1);
    }

    const parsedOptions = paraseResult.output;

    const config = defineConfig(parsedOptions);

    const sbMain = getStorybookMain(config.sbConfigPath)

    if (!(await isExistsPath(config.sbConfigPath))) {
      return reporter.printPathNotExists(config.sbConfigPath);
    }

    if (config.outputDir) {
      await runClearOutputDir(config, reporter);
    }

    await runBuild(sbMain, config, reporter);

    if (config.isWatch) {
      await runWacth(sbMain, config, reporter);
    }
  });

program.parse();
