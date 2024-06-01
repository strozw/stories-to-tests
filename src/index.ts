#!/usr/bin/env node
import path from 'node:path'
import { Command } from 'commander'
import { serverRequire } from '@storybook/core-common';
import { Config } from './types.js';
import { runBuild, runClearOuputDir, runWacth } from './runners.js';
import { CreateFileReporter } from './reporters.js';
import { Eta } from 'eta';

const getStorybookMain = (configDir = '.storybook') => {
	return serverRequire(path.join(path.resolve(configDir), 'main'))
}

const program = new Command()

program
	.name('stories-to-tests')
	.description('yet another storybook test runner for vitest or ...')
	.version('0.0.1')
	.option('-c --config <path>', '`.storybook` config dir path')
	.option('-t --template-type <template-type>', 'template type. but now `vitest-react` only ')
	.option('--template-dir <template-dir-path>', 'compoent type. but now `vitest-react` only ')
	.option('-o --output-dir <path>', 'test files ouput dir path. if not set, test code will be generated next to stories filed.')
	.option('-w --watch', 'watch target stories paths. if add or delete stories file, realted test code will be generated or deleted.')
	.action(async (options) => {
		const cwd = process.cwd()

		const sbMain = getStorybookMain(String(options.config))

		const sbConfigPath = path.resolve(options.config)

		const outputDir = options.outputDir || ''

		const templateType = options.templateType || 'vitest-react'

		const templateDir = templateType === 'custom'
			? path.resolve(cwd, options.templateDir)
			: path.resolve(__dirname, `../templates/${templateType}`)

		const isWatch = Boolean(options.watch)

		const config: Config = {
			cwd,
			sbConfigPath,
			outputDir,
			templateType,
			templateDir,
		}

		const reporter = new CreateFileReporter()

		if (outputDir) {
			await runClearOuputDir(config)
		}

		await runBuild(sbMain, config, reporter)

		if (isWatch) {
			await runWacth(sbMain, config, reporter)
		}
	})

program.parse()
