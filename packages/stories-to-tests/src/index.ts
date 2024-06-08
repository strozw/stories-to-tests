#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import * as v from "valibot";
import { Reporter } from "./reporter.js";
import { runBuild, runClearOutputDir, runWacth } from "./runners.js";
import type { Config } from "./types.js";
import { getStorybookMain, isExistsPath } from "./utils.js";

const optionsShema = v.intersect([
  v.object({
    config: v.string(),
    outputDir: v.string(),
  }),
  v.union([
    v.object({
      templateType: v.picklist(["vitest-react", "playwright-react"]),
      templateDir: v.undefined_(),
    }),
    v.object({
      templateType: v.undefined_(),
      templateDir: v.string(),
    }),
  ]),
]);

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

    const paraseResult = v.safeParse(optionsShema, options);

    if (!paraseResult.success) {
      for (const issue of paraseResult.issues) {
        if (issue.issues) {
          console.error(v.flatten(issue.issues));
        }
      }

      return process.exit(1);
    }

    const parsedOptions = paraseResult.output;

    const cwd = process.cwd();

    const sbMain = getStorybookMain(String(parsedOptions.config));

    const sbConfigPath = path.resolve(parsedOptions.config);

    if (!(await isExistsPath(sbConfigPath))) {
      return reporter.printPathNotExists(sbConfigPath);
    }

    const outputDir = parsedOptions.outputDir || "";

    const templateType = parsedOptions.templateType ?? "custom";

    const templateDir = parsedOptions.templateDir
      ? path.resolve(cwd, parsedOptions.templateDir)
      : path.resolve(__dirname, `../templates/${templateType}`);

    const isWatch = Boolean(options.watch);

    const config: Config = {
      cwd,
      sbConfigPath,
      outputDir,
      templateType,
      templateDir,
    };

    if (outputDir) {
      await runClearOutputDir(config, reporter);
    }

    await runBuild(sbMain, config, reporter);

    if (isWatch) {
      await runWacth(sbMain, config, reporter);
    }
  });

program.parse();
