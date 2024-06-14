import fs from "node:fs";
import path from "node:path";
import { serverRequire } from "@storybook/core-common";

export type Ok<V = unknown> = { value: V };
export type Err<E = unknown> = { error: E };

export type Result<V = unknown, E = unknown> = Ok<V> | Err<E>;

export const throwableToResult = <T extends () => unknown>(produce: T) => {
  try {
    return { value: produce() } as Ok<T extends () => infer R ? R : never>;
  } catch (error) {
    return { error };
  }
};

export const asyncThrowableToResult = async <T extends () => Promise<unknown>>(
  produce: T,
) => {
  try {
    return {
      value: await produce(),
    } as Ok<T extends () => Promise<infer R> ? R : never>;
  } catch (error) {
    return { error };
  }
};

export const isErrorResult = (result: Result): result is { error: unknown } => {
  return "error" in result;
};

export const getStorybookMain = (configDirPath: string) => {
  return serverRequire(path.join(configDirPath, "main"));
};

export const createOutputDirPaht = (cwd: string, outputDir: string) => {
  return path.resolve(cwd, outputDir);
};

export const createStoriesAbsPath = (
  storiesPath: string,
  sbConfigPath: string,
) => {
  return path.resolve(sbConfigPath, storiesPath);
};

export const createStoriesRelPath = (
  cwd: string,
  sbConfigPath: string,
  storiesPath: string,
) => {
  return createStoriesAbsPath(storiesPath, sbConfigPath).replace(
    new RegExp(`^${cwd}/`),
    "",
  );
};

export const templatePathToName = (templatePath: string, templateDir: string) =>
  templatePath.replace(new RegExp(`^${templateDir}/`), "");

export const isExistsPath = async (filePath: string) => {
  return Boolean(
    await fs.promises.stat(filePath).catch(async () => {
      return false;
    }),
  );
};

export const createFile = async (
  filePath: string,
  body: string,
  mkdir: boolean,
) => {
  if (mkdir) {
    const dirPath = path.dirname(filePath);

    await fs.promises.stat(dirPath).catch(async () => {
      await fs.promises.mkdir(dirPath, { recursive: true });
    });
  }

  const isExists = await isExistsPath(filePath);

  await fs.promises
    .writeFile(filePath, body)
    .then(() => true)
    .catch(() => false);

  return { isCreated: true, isExists };
};

export const deleteFileOrDir = async (filePath: string) => {
  const result = await asyncThrowableToResult(() => fs.promises.stat(filePath));

  if (isErrorResult(result)) {
    return null;
  }

  if (result.value.isDirectory()) {
    await fs.promises.rm(filePath, { recursive: true });
  } else {
    await fs.promises.rm(filePath);
  }

  return filePath;
};

export const baseNameFromStoriesPath = (filePath: string) =>
  path.basename(filePath).replace(/\.stories\..+$/, "");
