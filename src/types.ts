export type Config = {
  cwd: string;
  sbConfigPath: string;
  outputDir: string;
  templateType: "vitest-react" | "custom";
  templateDir: string;
};
