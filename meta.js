console.log('欢迎使用诺亚云，组件模板')
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
				name: 'Runtime + Compiler: recommended for most users',
				value: 'standalone',
				short: 'standalone',
			}, {
				name: 'Runtime-only: about 6KB lighter min+gzip, but templates (or any Vue-specific HTML) are ONLY allowed in .vue files - render functions are required elsewhere',
				value: 'runtime',
				short: 'runtime',
			},],
		},
		router: { // 是否安装路由
			when: 'isNotTest',
			type: 'confirm',
			message: 'Install vue-router?',
		},
		vuex: { // 自定义
			type: "confirm",
			message: "Install vuex?"
		},
		less: { // 自定义
			type: "confirm",
			message: "Install less?",
		},

		lint: {
			when: 'isNotTest',
			type: 'confirm',
			message: 'Use ESLint to lint your code?',
		},
		lintConfig: {
			when: 'isNotTest && lint',
			type: 'list',
			message: 'Pick an ESLint preset',
			choices: [{
				name: 'Standard (https://github.com/standard/standard)',
				value: 'standard',
				short: 'Standard',
			}, {
				name: 'Airbnb (https://github.com/airbnb/javascript)',
				value: 'airbnb',
				short: 'Airbnb',
			}, {
				name: 'none (configure it yourself)',
				value: 'none',
				short: 'none',
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
		e2e: {
			when: 'isNotTest',
			type: 'confirm',
			message: 'Setup e2e tests with Nightwatch?',
		},
		autoInstall: {
			when: 'isNotTest',
			type: 'list',
			message: 'Should we run `npm install` for you after the project has been created? (recommended)',
			choices: [{
				name: 'Yes, use NPM',
				value: 'npm',
				short: 'npm',
			}, {
				name: 'Yes, use Yarn',
				value: 'yarn',
				short: 'yarn',
			}, {
				name: 'No, I will handle that myself',
				value: false,
				short: 'no',
			},],
		},
	},
	filters: { // 根据条件过滤文件
		'.eslintrc.js': 'lint',
		'.eslintignore': 'lint',
		'config/test.env.js': 'unit || e2e',
		'build/webpack.test.conf.js': "unit && runner === 'karma'",
		'test/unit/**/*': 'unit',
		'test/unit/index.js': "unit && runner === 'karma'",
		'test/unit/jest.conf.js': "unit && runner === 'jest'",
		'test/unit/karma.conf.js': "unit && runner === 'karma'",
		'test/unit/specs/index.js': "unit && runner === 'karma'",
		'test/unit/setup.js': "unit && runner === 'jest'",
		'test/e2e/**/*': 'e2e',
		'src/router/**/*': 'router',
		"src/store/**/*": "vuex", //加入自己的目录
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
