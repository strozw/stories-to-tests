import path from 'node:path'
import { asyncThrowableToResult, createFile, deleteFileOrDir, throwableToResult } from './utils.js'
import type { Config } from './types.js'
import { Eta } from 'eta'
import { glob } from 'glob'

export const createOutputDirPaht = (config: Config) => {
	return path.resolve(config.cwd, config.outputDir)
}

export const createStoriesAbsPath = (storiesPath: string, sbConfigPath: string) => {
	return path.resolve(sbConfigPath, storiesPath)
}

export const createStoriesRelPath = (storiesPath: string, config: Config) => {
	return createStoriesAbsPath(
		storiesPath,
		config.sbConfigPath
	).replace(new RegExp(`^${config.cwd}/`), '')
}

export const createTestFileAbsPath = (storiesAbsPath: string, templateName: string, config: Config) => {
	const {
		cwd,
		outputDir,
	} = config

	let testFileAbsPath = storiesAbsPath.replace(/\.stories\..+$/, `.${templateName.replace(/\.eta$/, '')}`)

	if (outputDir) {
		const basePath = createOutputDirPaht(config)
		const part = testFileAbsPath.replace(cwd, '')

		testFileAbsPath = path.join(basePath, part)
	}

	return testFileAbsPath
}

export const templatePathToName = (templatePath: string, templateDir: string) =>
	templatePath.replace(new RegExp(`^${templateDir}/`), '')


export type CreateTestFileResult = {
	testFilePath: string,
	isCreated: boolean,
	isExists: boolean
	error: unknown
}

export const createTestFiles = async (
	storiesPath: string,
	config: Config
) => {
	const {
		cwd,
		sbConfigPath,
		outputDir,
		templateDir
	} = config

	const storiesAbsPath = createStoriesAbsPath(storiesPath, sbConfigPath)

	const sbPreviewPath = path.join(sbConfigPath, 'preview')

	const testSuiteName = storiesAbsPath.replace(cwd, '')

	const renderer = new Eta({ views: templateDir })

	const globPath = path.join(templateDir, '*.eta')

	const templatePaths = await glob(globPath)

	const results: CreateTestFileResult[] = []

	await Promise.allSettled(templatePaths.map(async templatePath => {
		const result: CreateTestFileResult = {
			testFilePath: '',
			isCreated: false,
			isExists: false,
			error: null
		}

		const templateName = templatePathToName(templatePath, templateDir)

		const testFileAbsPath = createTestFileAbsPath(storiesAbsPath, templateName, config)

		result.testFilePath = testFileAbsPath.replace(`${cwd}/`, '')

		const importStoriesPath = `./${path.relative(path.dirname(testFileAbsPath), storiesAbsPath)}`

		const renderResult = throwableToResult(() => renderer.render(templateName, {
			importStoriesPath,
			sbPreviewPath,
			testSuiteName
		}))

		if ('error' in renderResult) {
			return results.push({ ...result, error: renderResult.error })
		}

		const fileCreationResult = await asyncThrowableToResult(() => createFile(
			testFileAbsPath,
			renderResult.value ?? '', Boolean(outputDir)
		))

		if ('error' in fileCreationResult) {
			return results.push({ ...result, error: renderResult.error })
		}

		results.push({
			...result,
			...fileCreationResult.value
		})
	}))

	return results
}

export type DeleteTestFileResult = {
	testFilePath: string,
	isDeleted: boolean
	error: unknown
}

export const deleteTestFiles = async (
	storiesPath: string,
	config: Config
) => {
	const { cwd, sbConfigPath, templateDir } = config

	const storiesAbsPath = createStoriesAbsPath(storiesPath, sbConfigPath)

	const templatePaths = await glob(path.join(templateDir, '*.eta'))

	const results: DeleteTestFileResult[] = []

	await Promise.allSettled(templatePaths.map(async templatePath => {
		const templateName = templatePathToName(templatePath, templateDir)

		const testFileAbsPath = createTestFileAbsPath(storiesAbsPath, templateName, config)

		const result: DeleteTestFileResult = {
			testFilePath: testFileAbsPath.replace(`${cwd}/`, ''),
			isDeleted: false,
			error: null
		}

		const fileDeletingResult = await asyncThrowableToResult(() => deleteFileOrDir(testFileAbsPath))

		if ('error' in fileDeletingResult) {
			return results.push({ ...result, error: fileDeletingResult.error })
		}

		results.push({ ...result, ...fileDeletingResult.value })
	}))

	return results
}
