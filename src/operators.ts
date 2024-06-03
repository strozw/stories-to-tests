import path from "node:path";
import { Eta } from "eta";
import { glob } from "glob";
import type { Config } from "./types.js";
import {
	asyncThrowableToResult,
	baseNameFromPath,
	createFile,
	createOutputDirPaht,
	createStoriesAbsPath,
	deleteFileOrDir,
	isErrorResult,
	templatePathToName,
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
		const basePath = createOutputDirPaht(cwd, outputDir);

		const part = testFileAbsPath.replace(cwd, "");

		testFileAbsPath = path.join(basePath, part);
	}

	return testFileAbsPath;
};

export type CreateTestFileResult = {
	testFilePath: string;
	isCreated: boolean;
	isExists: boolean;
	error: unknown;
};

export const createTestFiles = async (storiesPath: string, config: Config) => {
	const { cwd, sbConfigPath, outputDir, templateDir } = config;

	const storiesAbsPath = createStoriesAbsPath(storiesPath, sbConfigPath);

	const sbPreviewPath = path.join(sbConfigPath, "preview");

	const testSuiteName = storiesAbsPath.replace(cwd, "");

	const renderer = new Eta({ views: templateDir });

	const globPath = path.join(templateDir, "*.eta");

	const templatePaths = await glob(globPath);

	const results: CreateTestFileResult[] = [];

	await Promise.allSettled(
		templatePaths.map(async (templatePath) => {
			const result: CreateTestFileResult = {
				testFilePath: "",
				isCreated: false,
				isExists: false,
				error: null,
			};

			const templateName = templatePathToName(templatePath, templateDir);

			const testFileAbsPath = createTestFileAbsPath(
				storiesAbsPath,
				templateName,
				config,
			);

			result.testFilePath = testFileAbsPath.replace(`${cwd}/`, "");

			const importStoriesPath = `./${path.relative(
				path.dirname(testFileAbsPath),
				storiesAbsPath,
			)}`;

			const storiesFileBaseName = baseNameFromPath(importStoriesPath);

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
				return results.push({ ...result, error: renderResult.error });
			}

			results.push({
				...result,
				...fileCreationResult.value,
			});
		}),
	);

	return results;
};

export type DeleteTestFileResult = {
	testFilePath: string;
	isDeleted: boolean;
	error: unknown;
};

export const deleteTestFiles = async (storiesPath: string, config: Config) => {
	const { cwd, sbConfigPath, templateDir } = config;

	const storiesAbsPath = createStoriesAbsPath(storiesPath, sbConfigPath);

	const templatePaths = await glob(path.join(templateDir, "*.eta"));

	const results: DeleteTestFileResult[] = [];

	await Promise.allSettled(
		templatePaths.map(async (templatePath) => {
			const templateName = templatePathToName(templatePath, templateDir);

			const testFileAbsPath = createTestFileAbsPath(
				storiesAbsPath,
				templateName,
				config,
			);

			const result: DeleteTestFileResult = {
				testFilePath: testFileAbsPath.replace(`${cwd}/`, ""),
				isDeleted: false,
				error: null,
			};

			const fileDeletingResult = await asyncThrowableToResult(() =>
				deleteFileOrDir(testFileAbsPath),
			);

			if (isErrorResult(fileDeletingResult)) {
				return results.push({ ...result, error: fileDeletingResult.error });
			}

			results.push({ ...result, ...fileDeletingResult.value });
		}),
	);

	return results;
};

export const deleteOutputDir = async (config: Config) => {
	const { cwd, outputDir } = config;

	const outputDirPath = createOutputDirPaht(cwd, outputDir);

	const dirDeletingResult = await asyncThrowableToResult(() =>
		deleteFileOrDir(outputDirPath),
	);

	const result: { error: unknown; isDeleted: boolean } = {
		error: null,
		isDeleted: false,
	};

	if (isErrorResult(dirDeletingResult)) {
		return { ...result, error: dirDeletingResult.error };
	}

	return { ...result, ...dirDeletingResult.value };
};
