import axios from "axios"
import Loading from "../loading"
import qs from "qs"
import cookies from "vue-cookies";

let requestOptions = {
	Vue: null,//Vue实例
	Cookies: null,
	Axios: axios,//http请求
	Loading: Loading,//过场动画
	qs: qs,//序列化

	method: 'POST',//请求方式
	root: null,//默认主机与端口,根据vue实例提供(setVueInstance)
	path: '',//默认路径
	params: null,//请求参数
	data: null,//主体数据
	// contentType: {
	// 	get: "form",
	// 	post: 'json',
	// 	put: 'json',
	// 	delete: 'json'
	// },
	async: true,
	auth: true,
	headers: null,
	success: () => {
	},//请求成功执行函数
	error: () => {
	},//请求失败执行函数
	loadingOptions: {
		loading: false
	},
	dev: false
};

function judge(o, init) {
	if (o === undefined || o == null) {
		return init;
	} else {
		return o;
	}
}

function filter(options) {
	options.success = judge(options.success, requestOptions.success);
	options.error = judge(options.error, requestOptions.error);
	options.method = judge(options.method, requestOptions.method);
	// options.contentType = judge(options.contentType,requestOptions.contentType[options.method.toLocaleLowerCase()]);
	if (!options.url) {
		let root = options.root || requestOptions.root;
		delete options.root;
		let path = options.path || requestOptions.path;
		delete options.path;
		options.url = root + path;
	}
	options.params = judge(options.params, requestOptions.params);
	options.data = judge(options.data, requestOptions.data);
	options.async = judge(options.async, requestOptions.async);
	options.auth = judge(options.auth, requestOptions.auth);
	if (options.auth) {
		let token = requestOptions.Cookies.get("token");
		if (token) {
			options.headers = {"authorization": token};
		} else {
			options.headers = null;
		}
	} else {
		options.headers = null;
	}
	options.loadingOptions = judge(options.loadingOptions, requestOptions.loadingOptions);
	options.dev = judge(options.dev, requestOptions.dev);
	return options
}

let method = {
	GET: "get",
	POST: "post",
	PUT: "put",
	DELETE: "delete"
};

// let contentType = {
// 	form: "form",
// 	json: "json"
// };


function install(Vue) {
	Vue.prototype.$ajax = this;
}

function setVueInstance(VueInstance) {
	requestOptions.Vue = VueInstance;
	requestOptions.root = VueInstance.$httpUrl.remoteBaseUrl;
	requestOptions.Axios.interceptors.response.use(function (response) {
		return response;
	}, function (error) {
		if (error.response.status === 401) {
			requestOptions.Vue.$message.error("用户token已失效,3秒钟后将回到登录页面");
			cookies.remove("token");
			setInterval(function () {
				requestOptions.Vue.$router.push('/login');
			}, 3000);
		}
		return error;
	});
}

function getVueInstance() {
	return requestOptions.Vue;
}

function setCookiesInstance(Cookies) {
	requestOptions.Cookies = Cookies;
}

async function async_execute(options) {
	return await requestOptions.Axios({
		method: options.method,
		url: options.url,
		headers: options.headers,
		params: options.params,
		data: options.data
	})
}

function execute(options) {
	return requestOptions.Axios({
		method: options.method,
		url: options.url,
		headers: options.headers,
		params: options.params,
		data: options.data
	})
}

function request(options) {
	filter(options);

	if (options.loadingOptions.loading)
		requestOptions.Loading.loadStart(options.loadingOptions);

	let promise;
	if (options.async) {
		promise = execute(options);
	} else {
		promise = async_execute(options);
	}

	promise.then(response => {
		options.response = response;
		options.data = response.data;
		if (options.success)
			options.success(response);
		if (options.loadingOptions.loading)
			requestOptions.Loading.loadFinish(options.loadingOptions.time);
		if (options.dev) {
			console.log(options);
		}
	}).catch(error => {
		if (options.dev) {
			requestOptions.Vue.$message.error("哎呀，出错啦！");
			console.error(error);
		}
		options.response = error.response;
		if (options.error)
			options.error(error.response);
		if (options.loadingOptions.loading)
			requestOptions.Loading.loadFinish(options.loadingOptions.time);
		if (options.dev) {
			console.log(options);
		}
	});

}

function allrequest(options, total_options) {
	options = options.map(option => filter(option));
	if (total_options) {
		filter(total_options);
	} else {
		total_options = filter({});
	}

	if (total_options.loadingOptions.loading)
		requestOptions.Loading.loadStart(total_options.loadingOptions);

	requestOptions.Axios.all(options.map(execute))
		.then(axios.spread((...res) => {
			res.forEach((value, index, array) => {
				console.log(options[index]);
				options[index].response = value;
				options[index].data = value.data;
				if (options[index].success)
					options[index].success(value);
			});

			if (total_options.success)
				total_options.success(res);
			if (total_options.loadingOptions.loading)
				requestOptions.Loading.loadFinish(total_options.loadingOptions.time);
			if (total_options.dev) {
				console.log(total_options);
			}
		})).catch((...err) => {
		err.forEach((value, index, array) => {
			options[index].response = value.response;
			if (options[index].error)
				options[index].error(value.response);
		});

		if (total_options.dev) {
			requestOptions.Vue.$message.error("哎呀，出错啦！");
			console.error(err);
		}
		total_options.response = err;
		if (total_options.error)
			total_options.error(err);
		if (total_options.loadingOptions.loading)
			requestOptions.Loading.loadFinish(total_options.loadingOptions.time);
		if (total_options.dev) {
			console.log(total_options);
		}
	});
}


export default {
	method, install, setVueInstance, getVueInstance, setCookiesInstance, request, allrequest
}