import path from 'node:path'
import { createFile, deleteFileOrDir } from './utils.js'
import type { Config } from './types.js'
import { Eta } from 'eta'
import { glob } from 'glob'

export const createOutputDirPaht = (config: Config) => {
	return path.resolve(config.cwd, config.outputDir)
}

export const createStoriesAbsPath = (storiesPath: string, sbConfigPath: string) => {
	return path.resolve(sbConfigPath, storiesPath)
}

export const createTestFileAbsPath = (storiesAbsPath: string, templateName: string, config: Config) => {
	const {
		cwd,
		outputDir,
	} = config

	let testFileAbsPath = storiesAbsPath.replace(/\.stories\..+$/, `.${templateName}`)

	if (outputDir) {
		const basePath = createOutputDirPaht(config)
		const part = testFileAbsPath.replace(cwd, '')

		testFileAbsPath = path.join(basePath, part)
	}

	return testFileAbsPath
}

export const templatePathToName = (templatePath: string, templateDir: string) =>
	templatePath.replace(new RegExp(`^${templateDir}`), '').replace(/\.eta$/, '')


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
		const templateName = templatePathToName(templatePath, templateDir)

		const testFileAbsPath = createTestFileAbsPath(storiesAbsPath, templateName, config)

		const importStoriesPath = `./${path.relative(path.dirname(testFileAbsPath), storiesAbsPath)}`

		const code = renderer.render(templateName, {
			importStoriesPath,
			sbPreviewPath,
			testSuiteName
		})

		const result = await createFile(testFileAbsPath, code, Boolean(outputDir))

		const isExists = result && typeof result === 'object' && !('error' in result)

		const error = !isExists ? result.error : null

		const isCreated = !error

		const testFilePath = testFileAbsPath.replace(`${cwd}/`, '')

		results.push({
			testFilePath,
			isCreated,
			isExists,
			error
		})
	}))

	return results
}

export type DeleteTestFileResult = {
	testFilePath: string,
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

		const result = await deleteFileOrDir(testFileAbsPath)

		const testFilePath = testFileAbsPath.replace(`${cwd}/`, '')

		return { ...result, testFilePath }
	}))

	return results
}
