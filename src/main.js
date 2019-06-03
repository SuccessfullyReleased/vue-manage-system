import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from './store'

Vue.config.productionTip = false;


import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI, {size: 'small'});

import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor);

import cookies from 'vue-cookies'

Vue.use(cookies);

import ajax from "./components/ajax"

Vue.use(ajax);

import _ from "lodash"

Vue.prototype.$lodash = _;

import httpUrl from "@router/httpUrl"

Vue.use(httpUrl);

import bus from "@components/bus"

Vue.use(bus);


router.beforeEach((to, from, next) => {
	let token = cookies.get("token");
	let user = store.getters.getUser;
	if ((!token || !user) && (to.path === "/" || to.path === "/login" || to.path === "/register")) {
		next();
	} else if ((!token || !user) && to.path !== "/login" && to.path !== "/register") {
		if (ajax.getVueInstance()) {
			ajax.getVueInstance().$message.error("用户token已失效,回到登录页面");
		}
		console.error("页面跳转：401");
		next("/login");
	} else {
		ajax.request({
			method: ajax.method.GET,
			url: "/rbac/user/token",
			dev: false,
			loadingOptions: {
				loading: true,
				time: 0.2,
				text: "正在切换页面"
			},
			success: () => {
				if (to.meta.permission) {
					let index = _.findIndex(user.accesses, access => {
						if (access.menu) {
							return access.menu.name === to.meta.title;
						} else {
							return false;
						}
					});
					if (index === -1)
						next("/403");
					else {
						next();
					}
				} else {
					next();
				}
			},
			error: () => {
				console.error("用户token已失效,回到登录页面");
			}
		});
	}
});


let VueInstance = new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');

VueInstance.$ajax.setVueInstance(VueInstance);
VueInstance.$ajax.setCookiesInstance(cookies);

//Date格式化为String，全局写入
Date.prototype.Format = function (fmt) {
	let o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"H+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (let k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
};