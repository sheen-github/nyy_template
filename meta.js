// 该文件必须导出为一个对象, 用于定义模板的 meta 信息
const path = require('path')
const fs = require('fs')

const {
	sortDependencies,
	installDependencies,
	runLintFix,
	printMessage,
} = require('./utils')
const pkg = require('./package.json')

const templateVersion = pkg.version

const {
	addTestAnswers
} = require('./scenarios')

module.exports = {
	metalsmith: {
		// When running tests for the template, this adds answers for the selected scenario
		before: addTestAnswers
	},
	helpers: { //自定义的 Handlebars 辅助函数
		if_or (v1, v2, options) {

			if (v1 || v2) {
				return options.fn(this)
			}

			return options.inverse(this)
		},
		template_version () {
			return templateVersion
		},
	},

	prompts: { // 收集用户自定义数据
		build: {
			when: 'isNotTest',
			type: 'list',
			message: 'Vue build',
			choices: [{
				name: '运行加编译（推荐使用）',
				value: 'standalone',
				short: 'standalone',
			}, {
				name: 'Runtime-only: about 6KB lighter min+gzip, but templates (or any Vue-specific HTML) are ONLY allowed in .vue files - render functions are required elsewhere（仅运行）',
				value: 'runtime',
				short: 'runtime',
			},],
		},
		unit: {
			when: 'isNotTest',
			type: 'confirm',
			message: 'Set up unit tests',
		},
		runner: {
			when: 'isNotTest && unit',
			type: 'list',
			message: 'Pick a test runner',
			choices: [{
				name: 'Jest',
				value: 'jest',
				short: 'jest',
			}, {
				name: 'Karma and Mocha',
				value: 'karma',
				short: 'karma',
			}, {
				name: 'none (configure it yourself)',
				value: 'noTest',
				short: 'noTest',
			},],
		},
	},
	filters: { // 根据条件过滤文件
		'config/test.env.js': 'unit || e2e',
		'build/webpack.test.conf.js': "unit && runner === 'karma'",
		"src/store/**/*": "vuex",  //加入自己的目录
		"src/router/**/*": "router"
	},
	complete: function (data, {
		chalk
	}) {
		const green = chalk.green

		sortDependencies(data, green)

		const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName)

		if (data.autoInstall) {
			installDependencies(cwd, data.autoInstall, green)
				.then(() => {
					return runLintFix(cwd, data, green)
				})
				.then(() => {
					printMessage(data, green)
				})
				.catch(e => {
					console.log(chalk.red('Error:'), e)
				})
		} else {
			printMessage(data, chalk)
		}
	},
}