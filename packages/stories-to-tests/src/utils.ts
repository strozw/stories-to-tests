import fs from "node:fs";
import path from "node:path";

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

export const buildStorybookMainRequirePath = (configDirPath: string) => {
  return path.join(configDirPath, "main");
};

export const buildOutputDirPaht = (cwd: string, outputDir: string) => {
  return path.resolve(cwd, outputDir);
};

export const buildStoriesAbsPath = (
  storiesPath: string,
  sbConfigPath: string,
) => {
  return path.resolve(sbConfigPath, storiesPath);
};

export const buildStoriesRelPath = (
  cwd: string,
  sbConfigPath: string,
  storiesPath: string,
) => {
  return buildStoriesAbsPath(storiesPath, sbConfigPath).replace(
    new RegExp(`^${cwd}/`),
    "",
  );
};

export const convertTemplatePathToName = (
  templatePath: string,
  templateDir: string,
) => templatePath.replace(new RegExp(`^${templateDir}/`), "");

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

export const convertStoriesPathToBaseName = (filePath: string) =>
  path.basename(filePath).replace(/\.stories\..+$/, "");
