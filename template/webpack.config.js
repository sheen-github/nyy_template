const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
console.log(glob)
const entry = {};
const entryFiles = glob.sync("./src/components/**/**/*.js")
const VueLoaderPlugin = require('vue-loader/lib/plugin');
console.log("文件路经", entryFiles)
entryFiles.forEach(item => {
	let match = item.match(/src\/components\/.*\/(.*)\/config\.js/);
	let pageName = match && match[1];
	entry["ib-" + pageName] = item;
})
console.log("文件入口entry", entry)
module.exports = {
	entry: entry,
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].js',
	},
	plugins: [
		// make sure to include the plugin for the magic
		new VueLoaderPlugin()
	],
	module: {
		rules: [{
			test: /\.css$/,
			use: [
				'vue-style-loader',
				'css-loader',
				'style-loader!css-loader'
			],
		}, {
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
				loaders: {}
				// other vue-loader options go here
			}
		}, {
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: /node_modules/
		}, {
			test: /\.(png|jpg|gif|svg)$/,
			loader: 'file-loader',
			options: {
				name: '[name].[ext]?[hash]'
			}
		}, {
			test: /\.less$/,
			loader: "style-loader!css-loader!less-loader",

		}
		]
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		},
		extensions: ['*', '.js', '.vue', '.json']
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true,
		overlay: true
	},
	performance: {
		hints: false
	},
	devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
	module.exports.devtool = '#source-map'
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	])
	module.exports.externals = {
		/**
		*key: main.js中全局引入的路径
		*value: 全局暴露出来的对象名
		*/
		'vue': 'Vue',
		'axios': 'axios',
		'vue-router': 'VueRouter',
	}

}