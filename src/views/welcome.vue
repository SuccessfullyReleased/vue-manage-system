<template>
	<div>
		<el-row :gutter="20">
			<el-col :span="8">
				<el-card shadow="hover" :body-style="{ height: '180px'}">
					<div slot="header" class="header">
						<span>欢迎访问</span>
					</div>
					<div class="user-info">
						<img :src="avatorBaseUrl+user.avator" class="user-avator" alt="用户头像">
						<div class="user-info-cont">
							<div class="user-info-name">{{user.username}}</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="16">
				<el-card shadow="hover">
					<div slot="header" class="header">
						<span>菜单</span>
					</div>

					<el-row :gutter="20" class="mgb20">
						<el-col :span="12">
							<el-card shadow="hover" class="Card">
								<div class="grid-content grid-con-1">
									<i class="el-icon-s-tools grid-con-icon"></i>
									<div class="grid-cont-right">
										<div class="grid-num">系统管理</div>
									</div>
								</div>
							</el-card>
						</el-col>
						<el-col :span="12">
							<el-card shadow="hover" class="Card">
								<div class="grid-content grid-con-2">
									<i class="el-icon-s-comment grid-con-icon"></i>
									<div class="grid-cont-right">
										<div class="grid-num">内容管理</div>
									</div>
								</div>
							</el-card>
						</el-col>
					</el-row>

<!--					<el-row :gutter="20" class="mgb20">-->
<!--						<el-col :span="12">-->
<!--							<el-card shadow="hover" class="Card">-->
<!--								<div class="grid-content grid-con-3">-->
<!--									<i class="el-icon-info grid-con-icon"></i>-->
<!--									<div class="grid-cont-right">-->
<!--										<div class="grid-num">注意事项</div>-->
<!--									</div>-->
<!--								</div>-->
<!--							</el-card>-->
<!--						</el-col>-->
<!--						<el-col :span="12">-->
<!--							<el-card shadow="hover" class="Card">-->
<!--								<div class="grid-content grid-con-4">-->
<!--									<i class="el-icon-picture grid-con-icon"></i>-->
<!--									<div class="grid-cont-right">-->
<!--										<div class="grid-num">图表</div>-->
<!--									</div>-->
<!--								</div>-->
<!--							</el-card>-->
<!--						</el-col>-->
<!--					</el-row>-->

				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import {mapGetters} from "vuex";

	export default {
		name: "welcome",
		data() {
			return {
				avatorBaseUrl: this.$httpUrl.rbac + "avators/"
			}
		},
		computed: {
			...mapGetters({
				user: 'getUser'
			})
		},
		created() {
			// 通过 Event Bus 进行组件间通信，来刷新头像
			this.$bus.$on('flushAvator', msg => {
				this.avator = msg;
			});
		}
	}
</script>

<style lang="less" scoped>
	.grid-content {
		display: flex;
		align-items: center;
		height: 100px;
	}

	.grid-cont-right {
		flex: 1;
		text-align: center;
		font-size: 12px;
		color: #999;
	}

	.grid-num {
		font-size: 30px;
		font-weight: bold;
	}

	.grid-con-icon {
		font-size: 50px;
		width: 100px;
		height: 100px;
		text-align: center;
		line-height: 100px;
		color: #fff;
	}

	.grid-con-1 .grid-con-icon {
		background: rgb(45, 140, 240);
	}

	.grid-con-1 .grid-num {
		color: rgb(45, 140, 240);
	}

	.grid-con-2 .grid-con-icon {
		background: rgb(100, 213, 114);
	}

	.grid-con-2 .grid-num {
		color: rgb(45, 140, 240);
	}

	.grid-con-3 .grid-con-icon {
		background: rgb(242, 94, 67);
	}

	.grid-con-3 .grid-num {
		color: rgb(242, 94, 67);
	}

	.grid-con-4 .grid-con-icon {
		background: rgb(207, 9, 141);
	}

	.grid-con-4 .grid-num {
		color: rgb(207, 9, 141);
	}

	.user-info {
		display: flex;
		align-items: center;
		text-align: center;
		margin-top: 20px;
		padding-bottom: 20px;
		margin-bottom: 20px;

		.user-avator {
			width: 120px;
			height: 120px;
			border-radius: 50%;
		}

		.user-info-cont {
			padding-left: 50px;
			flex: 1;
			font-size: 14px;
			color: #999;
		}

		.user-info-cont div:first-child {
			font-size: 30px;
			color: #222;
		}
	}

	.header {
		background-color: #FFFFFF;
		text-align: center;

		span {
			font-size: 30px;
			color: #409eff;
		}
	}

	.mgb20 {
		margin-bottom: 20px;
	}

	.mgb20 .Card {
		padding: 25px;
	}
</style>
