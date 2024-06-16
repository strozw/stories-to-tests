import chokidar from "chokidar";
import { glob } from "glob";
import type { Config } from "./config.js";
import {
  createTestFiles,
  deleteOutputDir,
  deleteTestFiles,
} from "./operators.js";
import type { Reporter } from "./reporter.js";
import { buildStoriesRelPath } from "./utils.js";

export const runClearOutputDir = async (config: Config, reporter: Reporter) => {
  const result = await deleteOutputDir(config);

  if (result.value) {
    const deletedRelPath = result.value.replace(`${config.cwd}/`, "");
    reporter.printDeletedOutputDir(deletedRelPath);
  }
};

export const runBuild = async (
  sbMain: { stories: string[] },
  config: Config,
  reporter: Reporter,
) => {
  const { cwd, sbConfigPath } = config;

  const storiesPaths = await glob(sbMain.stories, { cwd: sbConfigPath });

  await Promise.allSettled(
    storiesPaths.map(async (storiesPath) => {
      if (!storiesPath.includes(".stories.")) {
        return;
      }

      const results = await createTestFiles(storiesPath, config);

      const storiesRelPath = buildStoriesRelPath(
        cwd,
        sbConfigPath,
        storiesPath,
      );

      reporter.printStoriesPath(storiesRelPath);

      reporter.printCreateFilesResults(results);
    }),
  );

  reporter.printResult();
};

export const runWacth = async (
  sbMain: { stories: string[] },
  config: Config,
  reporter: Reporter,
) => {
  const { cwd, sbConfigPath } = config;

  const watcher = chokidar.watch(sbMain.stories, { cwd: config.sbConfigPath });

  watcher
    .on("ready", () => {
      console.log("");
      console.log("...waiting...");
      console.log("");

      watcher.on("add", async (storiesPath) => {
        const results = await createTestFiles(storiesPath, config);

        const storiesRelPath = buildStoriesRelPath(
          cwd,
          sbConfigPath,
          storiesPath,
        );

        reporter.printAddStoriesPath(storiesRelPath);

        reporter.printCreateFilesResults(results, { record: false });
      });
    })
    .on("unlink", async (storiesPath) => {
      const results = await deleteTestFiles(storiesPath, config);

      const storiesRelPath = buildStoriesRelPath(
        cwd,
        sbConfigPath,
        storiesPath,
      );

      reporter.printDeleteStoriesPath(storiesRelPath);

      reporter.printDeleteFileResults(results);
    });
};
