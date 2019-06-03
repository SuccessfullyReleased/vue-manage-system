import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			redirect: '/welcome'
		}, {
			//登录界面
			path: '/login',
			name: 'login',
			component: () => import("@views/login.vue")
		}, {
			//注册界面
			path: '/register',
			name: 'register',
			component: () => import("@views/register.vue")
		}, {
			//403
			path: '/403',
			name: '403',
			component: () => import("@views/403.vue"),
			meta: {title: '403'}
		}, {
			//404
			path: '/404',
			name: '404',
			component: () => import("@views/404.vue"),
			meta: {title: '404'}
		}, {
			path: '/',
			component: () => import("@views/common/Home.vue"),
			children: [
				{
					//欢迎界面
					path: '/welcome',
					name: 'welcome',
					component: () => import("@views/welcome.vue"),
					meta: {title: '欢迎界面'}
				}, {
					//账户设置界面
					path: '/setting',
					name: 'setting',
					component: () => import("@views/setting.vue"),
					meta: {title: '账户设置'}
				}, {
					//用户管理界面
					path: '/user_manage',
					name: 'user_manage',
					component: () => import("@views/user_manage.vue"),
					meta: {title: '用户管理', permission: true,}
				}, {
					//用户组管理界面
					path: '/group_manage',
					name: 'group_manage',
					component: () => import("@views/group_manage.vue"),
					meta: {title: '用户组管理', permission: true,}
				}, {
					//角色管理界面
					path: '/role_manage',
					name: 'role_manage',
					component: () => import("@views/role_manage.vue"),
					meta: {title: '角色管理', permission: true,}
				}, {
					//权限管理界面
					path: '/access_manage',
					name: 'access_manage',
					component: () => import("@views/access_manage.vue"),
					meta: {title: '权限管理', permission: true,}
				}, {
					//材料管理界面
					path: '/material_manage',
					name: 'material_manage',
					component: () => import("@views/material_manage.vue"),
					meta: {title: '材料管理'}
				}, {
					//贴吧管理界面
					path: '/note_manage',
					name: 'note_manage',
					component: () => import("@views/note_manage.vue"),
					meta: {title: '贴吧管理'}
				}, {
					//帖子详情界面
					path: '/note_content',
					name: 'note_content',
					component: () => import("@views/note_content.vue"),
					meta: {title: '帖子详情'}
				}
			]
		}
	]
})
