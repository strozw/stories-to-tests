export type Config = {
	cwd: string;
	sbConfigPath: string;
	outputDir: string;
	templateType: "vitest-react" | "playwright-react" | "custom";
	templateDir: string;
};
