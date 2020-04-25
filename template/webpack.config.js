const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const entry = {};
const entryFiles = glob.sync("./src/components/**/**/*.js")
const plugins = [
	new webpack.DefinePlugin({ // 创建可在全局配置的常量，比如打包编译环境。要包含实际的字符串
		'process.env': {
			NODE_ENV: '"production"'
		},
		'SERVICE_URL': JSON.stringify('https://dev.example.com')
	}),
	new webpack.optimize.UglifyJsPlugin({ // 文件压缩插件，减小js文件的大小，加速load速度。
		sourceMap: false,
		parallel: true, //使用多进程并行运行可提高构建速度。类型：Boolean|Number ,并发运行的默认数量：os.cpus().length - 1
		cache: true,// 是否启用缓存
		compress: {
			warnings: false
		}
	}),
	new webpack.LoaderOptionsPlugin({ //加载loader插件的一些配置选项
		minimize: true
	}),
]
entryFiles.forEach(item => {
	let match = item.match(/src\/components\/.*\/(.*)\/config\.js/);
	let pageName = match && match[1];
	entry["ib-" + pageName] = item;
})
console.log("文件路经", entryFiles)
console.log("文件入口entry", entry)
var externals = {
	/**
	*key: main.js中全局引入的路径
	*value: 全局暴露出来的对象名
	*/
	'vue': 'Vue',
	'vuex': 'Vuex',
	'vue-router': 'Router',
	'axios': 'axios',
	'element-ui': 'ElementUI',
}

module.exports = {
	plugins: plugins,// 插件
	externals: externals, //
	entry: entry, // 文件入口
	output: { // 出口文件
		path: path.resolve(__dirname, './dist'),
		filename: '[name].js',
	},
	externals: { // 忽略三方插件框架
		'vue': 'Vue',
		'vuex': 'Vuex',
		'vue-router': 'Router',
		'axios': 'axios',
		'element-ui': 'ElementUI',
	},
	module: {
		//编译规则
		rules: [{
			test: /\.css$/,
			use: [
				'vue-style-loader',
				'css-loader'
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

		},
		{
			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			loader: 'url-loader',
		}
		]
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		},
		extensions: ['*', '.js', '.vue', '.json']
	},
	devServer: { // npm run dev配置
		open: true,
		port: 8080,
		hot: true,
		// openPage: '/different/page', //配置项用于打开指定 URL 的网页。
		// historyApiFallback: true,
		// noInfo: true,
		// overlay: true,
		proxy: {
			'/proxy': {
				target: 'http://your_api_server.com',
				changeOrigin: true,
				pathRewrite: {
					'^/proxy': ''
				}
			}
		},
	},
	performance: {
		hints: false
	},
	// devtool: '#eval-source-map',
	devtool: false,
}
