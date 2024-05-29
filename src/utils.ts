import path from 'node:path'
import fs from 'node:fs'

export const createFile = async (filePath: string, body: string, mkdir: boolean) => {
	if (mkdir) {
		const dirPath = path.dirname(filePath)

		await fs.promises.stat(dirPath).catch(async () => {
			await fs.promises.mkdir(dirPath, { recursive: true })
		})
	}

	try {
		await fs.promises.writeFile(filePath, body)

		return { error: null }
	} catch (error) {
		return { error }
	}
}

export const deleteFileOrDir = async (filePath: string) => {
	try {
		const stat = await fs.promises.stat(filePath)

		if (stat.isDirectory()) {
			await fs.promises.rm(filePath, { recursive: true })
		} else {
			await fs.promises.rm(filePath)
		}

		return { error: null }
	} catch (error) {
		return { error }
	}
}
