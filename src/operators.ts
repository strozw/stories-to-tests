import path from 'node:path'
import { buildVitestReactStoriesTestCode } from "./templates.js"
import { createFile, deleteFile } from './utils.js'
import type { Config } from './types.js'
import { glob } from 'glob'

export const createStoriesAbsPath = (storiesPath: string, sbConfigPath: string) => {
	return path.resolve(sbConfigPath, storiesPath)
}

export const createTestFileAbsPath = (storiesAbsPath: string, {
	cwd,
	outputDir,
	componentType = 'react'
}: Config) => {
	let testFileAbsPath = storiesAbsPath.replace('.stories.', '.stories.test.')

	if (componentType === 'react') {
		testFileAbsPath = testFileAbsPath.replace(/.ts$/, '.tsx').replace(/.js$/, '.jsx')
	}

	if (outputDir) {
		const basePath = path.resolve(cwd, outputDir)
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

	const result = await deleteFile(testFileAbsPath)

	const testFilePath = testFileAbsPath.replace(`${config.cwd}/`, '')

	return { ...result, testFilePath }
}

export type DeleteTestFileResult = ReturnType<typeof deleteTestFile> extends Promise<infer T> ? T : never


export const deleteTestDir = async (
	relatedDirPath: string,
	config: Config
) => {
	const part = relatedDirPath.replace(config.cwd, '')

	const testDirPath = path.join(config.outputDir, part)

	const result = await deleteFile(testDirPath)

	return { ...result, testDirPath }
}

export type DeleteTestDirResult = ReturnType<typeof deleteTestDir> extends Promise<infer T> ? T : never
