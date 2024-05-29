import path from 'node:path'
import { buildVitestReactStoriesTestCode } from "./templates.js"
import { createFile, deleteFile } from './utils.js'
import type { Config } from './types.js'

export const createStoriesAbsPath = (storiesPath: string, sbConfigPath: string) => {
	return path.resolve(sbConfigPath, storiesPath)
}

export const createTestFilePath = (storiesAbsPath: string, {
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

	const testFileAbsPath = createTestFilePath(storiesAbsPath, config)

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

export type CreateFileResult = ReturnType<typeof createTestFile> extends Promise<infer T> ? T : never

export const deleteTestFile = async (
	storiesPath: string,
	config: Config
) => {
	const storiesAbsPath = createStoriesAbsPath(storiesPath, config.sbConfigPath)

	const testFileAbsPath = createTestFilePath(storiesAbsPath, config)

	const result = await deleteFile(testFileAbsPath)

	return result
}
