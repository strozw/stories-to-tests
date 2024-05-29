import path from 'node:path'
import { buildViteReactStoriesTestCode } from "./templates.js"
import { createFile } from './utils.js'
import type { Config } from './types.js'

export const createTestFile = async (
	storiesPath: string,
	{
		cwd,
		sbConfigPath,
		outputDir,
		testRunner = 'vite',
		componentType = 'react'
	}: Config) => {
	const storiesAbsPath = path.resolve(sbConfigPath, storiesPath)

	let testFileAbsPath = storiesAbsPath.replace('.stories.', '.stories.test.')

	if (componentType === 'react') {
		testFileAbsPath = testFileAbsPath.replace(/.ts$/, '.tsx').replace(/.js$/, '.jsx')
	}

	if (outputDir) {
		const basePath = path.resolve(cwd, outputDir)
		const part = testFileAbsPath.replace(cwd, '')

		testFileAbsPath = path.join(basePath, part)
	}

	const importStoriesPath = `./${path.relative(path.dirname(testFileAbsPath), storiesAbsPath)}`

	const testSuiteName = storiesAbsPath.replace(cwd, '')

	const code = (() => {
		switch (testRunner) {
			case 'vite':
			default: {
				switch (componentType) {
					case 'react':
					default: {
						return buildViteReactStoriesTestCode({
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
