<template>
	<div class="sidebar">
		<el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" background-color="#324157"
						 text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
			<template v-for="item in items">

				<template v-if="item.subs">
					<el-submenu :index="item.index" :key="item.index" v-show="item.show">

						<template slot="title">
							<i :class="item.icon"></i>
							<span slot="title">{{ item.title }}</span>
						</template>

						<el-menu-item v-for="(subItem) in item.subs" :key="subItem.index"
													:index="subItem.index" v-show="subItem.show">
							{{ subItem.title }}
						</el-menu-item>

					</el-submenu>
				</template>
				<template v-else>
					<el-menu-item :index="item.index" :key="item.index">
						<i :class="item.icon"></i>
						<span slot="title">{{ item.title }}</span>
					</el-menu-item>
				</template>
			</template>
		</el-menu>
	</div>
</template>

<script>

	import {mapGetters} from "vuex";

	export default {
		data() {
			return {
				collapse: false,
				items: [
					{
						icon: "el-icon-s-home",
						index: "welcome",
						title: "欢迎界面",
						show: true
					}, {
						icon: "el-icon-s-tools",
						index: "system_manage",
						title: "系统管理",
						show: false,
						subs: [
							{
								index: "user_manage",
								title: "用户管理",
								show: false
							}, {
								index: "group_manage",
								title: "用户组管理",
								show: false
							},
							{
								index: "role_manage",
								title: "角色管理",
								show: false
							},
							{
								index: "access_manage",
								title: "权限管理",
								show: false
							}
						]
					}, {
						icon: "el-icon-s-comment",
						index: "content_manage",
						title: "内容管理",
						show: true,
						subs: [
							{
								index: "material_manage",
								title: "材料管理",
								show: true
							}, {
								index: "note_manage",
								title: "贴吧管理",
								show: true
							}
						]
					}
				]
			};
		},
		computed: {
			onRoutes() {
				return this.$route.path.replace("/", "");
			},
			...mapGetters({
				user: 'getUser'
			})
		},
		created() {
			// 通过 Event Bus 进行组件间通信，来折叠侧边栏
			this.$bus.$on("collapse", msg => {
				this.collapse = msg;
			});

			let items = [];
			for (const item of this.items) {
				items = items.concat(item);
				if (item.subs) {
					items = items.concat(item.subs);
				}
			}

			let intersection = this.$lodash.intersectionWith(items, this.user.accesses, (a, b) => {
				if (b.menu) {
					return a.title === b.menu.name;
				} else {
					return false;
				}
			});
			intersection.forEach((item) => {
				item.show = true;
			});
		}
	};
</script>

<style scoped>
	.sidebar {
		display: block;
		position: absolute;
		left: 0;
		top: 65px;
		bottom: 0;
		overflow-y: scroll;
	}

	.sidebar::-webkit-scrollbar {
		width: 0;
	}

	.sidebar-el-menu:not(.el-menu--collapse) {
		width: 200px;
	}

	.sidebar > ul {
		height: 100%;
	}
</style>
