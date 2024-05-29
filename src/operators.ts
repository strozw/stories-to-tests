import path from 'node:path'
import { buildVitestReactStoriesTestCode } from "./templates.js"
import { createFile, deleteFileOrDir } from './utils.js'
import type { Config } from './types.js'

export const createOutputDirPaht = (config: Config) => {
	return path.resolve(config.cwd, config.outputDir)
}

export const createStoriesAbsPath = (storiesPath: string, sbConfigPath: string) => {
	return path.resolve(sbConfigPath, storiesPath)
}

export const createTestFileAbsPath = (storiesAbsPath: string, config: Config) => {
	const {
		cwd,
		outputDir,
		componentType = 'react'
	} = config

	let testFileAbsPath = storiesAbsPath.replace('.stories.', '.stories.test.')

	if (componentType === 'react') {
		testFileAbsPath = testFileAbsPath.replace(/.ts$/, '.tsx').replace(/.js$/, '.jsx')
	}

	if (outputDir) {
		const basePath = createOutputDirPaht(config)
		const part = testFileAbsPath.replace(cwd, '')

		testFileAbsPath = path.join(basePath, part)
	}

	return testFileAbsPath
}

export const createTestFile = async (
	storiesPath: string,
	config: Config
) => {
	const {
		cwd,
		sbConfigPath,
		outputDir,
		testRunner = 'vite',
		componentType = 'react'
	} = config

	const storiesAbsPath = createStoriesAbsPath(storiesPath, sbConfigPath)

	const testFileAbsPath = createTestFileAbsPath(storiesAbsPath, config)

	const importStoriesPath = `./${path.relative(path.dirname(testFileAbsPath), storiesAbsPath)}`

	const sbPreviewPath = path.join(sbConfigPath, 'preview')

	const testSuiteName = storiesAbsPath.replace(cwd, '')

	const code = (() => {
		switch (testRunner) {
			case 'vite':
			default: {
				switch (componentType) {
					case 'react':
					default: {
						return buildVitestReactStoriesTestCode({
							importStoriesPath,
							sbPreviewPath,
							testSuiteName
						})
					}
				}
			}
		}
	})()

	const result = await createFile(testFileAbsPath, code, Boolean(outputDir))

	const isExists = result && typeof result === 'object' && !('error' in result)

	const error = !isExists ? result.error : null

	const isCreated = !error

	const testFilePath = testFileAbsPath.replace(`${cwd}/`, '')

	return {
		testFilePath,
		isCreated,
		isExists,
		error
	}
}

export type CreateTestFileResult = ReturnType<typeof createTestFile> extends Promise<infer T> ? T : never

export const deleteTestFile = async (
	storiesPath: string,
	config: Config
) => {
	const storiesAbsPath = createStoriesAbsPath(storiesPath, config.sbConfigPath)

	const testFileAbsPath = createTestFileAbsPath(storiesAbsPath, config)

	const result = await deleteFileOrDir(testFileAbsPath)

	const testFilePath = testFileAbsPath.replace(`${config.cwd}/`, '')

	return { ...result, testFilePath }
}

export type DeleteTestFileResult = ReturnType<typeof deleteTestFile> extends Promise<infer T> ? T : never

