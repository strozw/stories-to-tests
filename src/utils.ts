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

export const deleteFile = async (filePath: string) => {
	try {
		await fs.promises.stat(filePath)

		await fs.promises.unlink(filePath)

		return { error: null }
	} catch (error) {
		return { error }
	}
}
