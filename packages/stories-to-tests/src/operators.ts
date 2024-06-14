import path from "node:path";
import { Eta } from "eta";
import { glob } from "glob";
import type { Config } from "./config.js";
import type { Result } from "./utils.js";
import {
  asyncThrowableToResult,
  convertStoriesPathToBaseName,
  createFile,
  buildOutputDirPaht,
  buildStoriesAbsPath,
  deleteFileOrDir,
  isErrorResult,
  convertTemplatePathToName,
  throwableToResult,
} from "./utils.js";

export const createTestFileAbsPath = (
  storiesAbsPath: string,
  templateName: string,
  config: Config,
) => {
  const { cwd, outputDir } = config;

  let testFileAbsPath = storiesAbsPath.replace(
    /\.stories\..+$/,
    `.${templateName.replace(/\.eta$/, "")}`,
  );

  if (outputDir) {
    const basePath = buildOutputDirPaht(cwd, outputDir);

    const part = testFileAbsPath.replace(cwd, "");

    testFileAbsPath = path.join(basePath, part);
  }

  return testFileAbsPath;
};

export type CreateTestFileResult = Result<{
  testFilePath: string;
  isCreated: boolean;
  isExists: boolean;
}>;

export const createTestFiles = async (storiesPath: string, config: Config) => {
  const { cwd, sbConfigPath, outputDir, templateDir } = config;

  const storiesAbsPath = buildStoriesAbsPath(storiesPath, sbConfigPath);

  const sbPreviewPath = path.join(sbConfigPath, "preview");

  const testSuiteName = storiesAbsPath.replace(cwd, "");

  const renderer = new Eta({ views: templateDir });

  const globPath = path.join(templateDir, "*.eta");

  const templatePaths = await glob(globPath);

  const results: CreateTestFileResult[] = [];

  await Promise.allSettled(
    templatePaths.map(async (templatePath) => {
      const result: CreateTestFileResult = {
        value: {
          testFilePath: "",
          isCreated: false,
          isExists: false,
        },
      };

      const templateName = convertTemplatePathToName(templatePath, templateDir);

      const testFileAbsPath = createTestFileAbsPath(
        storiesAbsPath,
        templateName,
        config,
      );

      result.value.testFilePath = testFileAbsPath.replace(`${cwd}/`, "");

      const importStoriesPath = `./${path.relative(
        path.dirname(testFileAbsPath),
        storiesAbsPath,
      )}`;

      const storiesFileBaseName =
        convertStoriesPathToBaseName(importStoriesPath);

      const renderResult = throwableToResult(() =>
        renderer.render(templateName, {
          importStoriesPath,
          storiesFileBaseName,
          sbPreviewPath,
          testSuiteName,
        }),
      );

      if (isErrorResult(renderResult)) {
        return results.push({ ...result, error: renderResult.error });
      }

      const fileCreationResult = await asyncThrowableToResult(() =>
        createFile(
          testFileAbsPath,
          renderResult.value ?? "",
          Boolean(outputDir),
        ),
      );

      if (isErrorResult(fileCreationResult)) {
        return results.push({ error: fileCreationResult.error });
      }

      result.value = {
        ...result.value,
        ...fileCreationResult.value,
      };

      results.push(result);
    }),
  );

  return results;
};

export type DeleteTestFileResult = Result<{
  testFilePath: string;
  deletedPath: null | string;
}>;

export const deleteTestFiles = async (storiesPath: string, config: Config) => {
  const { cwd, sbConfigPath, templateDir } = config;

  const storiesAbsPath = buildStoriesAbsPath(storiesPath, sbConfigPath);

  const templatePaths = await glob(path.join(templateDir, "*.eta"));

  const results: DeleteTestFileResult[] = [];

  await Promise.allSettled(
    templatePaths.map(async (templatePath) => {
      const templateName = convertTemplatePathToName(templatePath, templateDir);

      const testFileAbsPath = createTestFileAbsPath(
        storiesAbsPath,
        templateName,
        config,
      );

      const result: DeleteTestFileResult = {
        value: {
          testFilePath: testFileAbsPath.replace(`${cwd}/`, ""),
          deletedPath: null,
        },
      };

      const fileDeletingResult = await asyncThrowableToResult(() =>
        deleteFileOrDir(testFileAbsPath),
      );

      if (isErrorResult(fileDeletingResult)) {
        return results.push({ error: fileDeletingResult.error });
      }

      result.value.deletedPath = fileDeletingResult.value;

      results.push(result);
    }),
  );

  return results;
};

export const deleteOutputDir = async (config: Config) => {
  const { cwd, outputDir } = config;

  const outputDirPath = buildOutputDirPaht(cwd, outputDir);

  const dirDeletingResult = await asyncThrowableToResult(() =>
    deleteFileOrDir(outputDirPath),
  );

  const result = {
    error: null,
    value: "",
  };

  if (isErrorResult(dirDeletingResult)) {
    return { ...result, error: dirDeletingResult.error };
  }

  return { ...result, ...dirDeletingResult };
};
