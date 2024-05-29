import path from 'node:path'
import fs from 'node:fs'
import { generateViteReactStoriesTestCode } from "./test-code-generators.js"
import { createFile } from './utils.js'
import { Config } from './types.js'

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
						return generateViteReactStoriesTestCode({
							importStoriesPath,
							testSuiteName
						})
					}
				}
			}
		}
	})()

	const result = await createFile(testFileAbsPath, code, Boolean(outputDir))

	// const result = await fs.promises.stat(testFileAbsPath).catch(async () => {
	// 	return await createFile(testFileAbsPath, code)
	// }).then(async result => {
	// 	// if (!('error' in result)) {
	// 	// 	return await createFile(testFileAbsPath, code)
	// 	// }

	// 	return result
	// })

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
