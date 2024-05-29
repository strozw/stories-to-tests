#!/usr/bin/env node
import path from 'node:path'
import { Command } from 'commander'
import { serverRequire } from '@storybook/core-common';
import { Config } from './types.js';
import { runBuild, runWacth } from './runners.js';
import { CreateFileReporter } from './reporters.js';

const getStorybookMain = (configDir = '.storybook') => {
	return serverRequire(path.join(path.resolve(configDir), 'main'))
}

const program = new Command()

program
	.name('stories-to-tests')
	.description('yet another storybook test runner for vitest or ...')
	.version('0.0.1')
	.option('-c --config <path>', '`.storybook` ディレクトリを指定する')
	.option('-r --test-runner <test-runner-name>', '生成する test の test runner')
	.option('-t --component-type <component-type-name>', 'storybook を利用している component のタイプ')
	.option('-o --output-dir <path>', '出力先のディレクトリを指定する')
	.option('-w --watch', '対象の stories ファイルを監視してテストファイルを生成する')
	.option('--no-run', '即時に変換を実行しない')
	.action(async (options) => {
		const sbMain = getStorybookMain(String(options.config))

		const sbConfigPath = path.resolve(options.config)

		const outputDir = options.outputDir || ''

		const testRunner = options.testRunner || 'vite'

		const componentType = options.componentType || 'react'

		const isWatch = Boolean(options.watch)

		const isRun = Boolean(options.run)

		const cwd = process.cwd()

		const config: Config = {
			cwd,
			sbConfigPath,
			outputDir,
			testRunner,
			componentType,
		}

		const reporter = new CreateFileReporter()

		if (isRun) {
			await runBuild(sbMain, config, reporter)
		}

		if (isWatch) {
			await runWacth(sbMain, config, reporter)
		}
	})

program.parse()
