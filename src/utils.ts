import path from 'node:path'
import fs from 'node:fs'

export const throwableToResult = <T extends () => unknown>(produce: T) => {
	try {
		return { value: produce() as T extends () => infer R ? R : never }
	} catch (error) {
		return { error }
	}
}

export const asyncThrowableToResult = async <T extends () => Promise<unknown>>(produce: T) => {
	try {
		return { value: await produce() as T extends () => Promise<infer R> ? R : never }
	} catch (error) {
		return { error }
	}
}

export const createFile = async (filePath: string, body: string, mkdir: boolean) => {
	if (mkdir) {
		const dirPath = path.dirname(filePath)

		await fs.promises.stat(dirPath).catch(async () => {
			await fs.promises.mkdir(dirPath, { recursive: true })
		})
	}

	const isExists = Boolean(await fs.promises.stat(filePath).catch(async () => { return false }))

	await fs.promises.writeFile(filePath, body).then(() => true).catch(() => false)

	return { isCreated: true, isExists, }
}

export const deleteFileOrDir = async (filePath: string) => {
	const stat = await fs.promises.stat(filePath)

	if (stat.isDirectory()) {
		await fs.promises.rm(filePath, { recursive: true })
	} else {
		await fs.promises.rm(filePath)
	}

	return { isDeleted: true }
}
