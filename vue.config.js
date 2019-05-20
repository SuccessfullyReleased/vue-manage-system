'use strict';

const resolve = (dir) => require('path').join(__dirname, dir);

module.exports = {
	publicPath: "vue-manage-system",
	devServer: {
		open: true,
		port: 5001,
		https: false,
		hotOnly: false,
		proxy: {
			'/api': {
				target: "https://localhost:5000/rbac/",
				ws: true,
				changeOrigin: true,
				pathRewrite: {
					"^/api": ""
				}
			}
		}
	},
	chainWebpack: (config)=>{
		config.resolve.alias
			.set('@', resolve('src'))
			.set('@components',resolve('src/components'))
			.set('@views',resolve('src/views'))
			.set('@router',resolve('src/router'))
			.set('@public',resolve('public'))
	}
};