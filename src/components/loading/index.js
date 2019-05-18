import {Loading} from 'element-ui'

let defaultConfig = {
	loadService: Loading,

	lock: true,
	time: 1,
	text: "请稍候",
	spinner: "el-icon-loading",
	background: "rgba(0, 0, 0, 0.8)",
	target: document.querySelector("body")
};

function filter(loadingOptions) {
	loadingOptions.lock = loadingOptions.lock || defaultConfig.lock;
	loadingOptions.time = loadingOptions.time || defaultConfig.time;
	loadingOptions.text = loadingOptions.text || defaultConfig.text;
	loadingOptions.spinner = loadingOptions.spinner || defaultConfig.spinner;
	loadingOptions.background = loadingOptions.background || defaultConfig.background;
	loadingOptions.target = loadingOptions.target ? document.getElementById(loadingOptions.target) : defaultConfig.target;
}

function loadStart(loadingOptions) {
	filter(loadingOptions);
	this.LoadingInstance = defaultConfig.loadService.service(loadingOptions);
}

function loadFinish(time = 0) {
	setTimeout(() => {
		this.LoadingInstance.close()
	}, time * 1000)
}

export default {
	loadStart, loadFinish
}


