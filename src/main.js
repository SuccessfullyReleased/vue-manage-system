import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from './store'

Vue.config.productionTip = false;


import ElementUI from 'element-ui';

Vue.use(ElementUI, {size: 'small'});
import 'element-ui/lib/theme-chalk/index.css';

import cookies from 'vue-cookies'

Vue.use(cookies);

import ajax from "./components/ajax"

Vue.use(ajax);
ajax.setCookiesInstance(cookies);

import _ from "lodash"

Vue.prototype.$lodash = _;

import httpUrl from "@router/httpUrl"

Vue.use(httpUrl);

import bus from "@components/bus"

Vue.use(bus);


router.beforeEach((to, from, next) => {
	let token = cookies.get("token");
	let user = store.getters.getUser;
	if ((!token || !user) && to.path !== "/login" && to.path !== "/register") {
		next("/login");
	} else if (to.meta.permission) {
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
			},
			error: () => {
				console.error("用户token已失效,回到登录页面");
			}
		});
	} else {
		next();
	}
});


let VueInstance = new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');

VueInstance.$ajax.setVueInstance(VueInstance);