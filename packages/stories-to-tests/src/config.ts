import path from "node:path";
import type { ParsedOptions } from "./options.js";

export type Config = {
  cwd: string;
  sbConfigPath: string;
  outputDir: string;
  templateType: "vitest-react" | "playwright-react" | "custom";
  templateDir: string;
  isWatch: boolean;
};

export const defineConfig = (options: ParsedOptions): Config => {
  const cwd = process.cwd();

  const sbConfigPath = path.resolve(options.config ?? ".storybook");

  const outputDir = options.outputDir || "";

  const templateType = options.templateType ?? "custom";

  const templateDir = options.templateDir
    ? path.resolve(cwd, options.templateDir)
    : path.resolve(__dirname, `../templates/${templateType}`);

  const isWatch = Boolean(options.watch);

  return {
    cwd,
    sbConfigPath,
    outputDir,
    templateType,
    templateDir,
    isWatch,
  };
};
