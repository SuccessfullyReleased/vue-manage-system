<template>
	<div class="login-wrap">
		<div class="ms-title">vue-manage-system</div>
		<div class="ms-login">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px">
				<el-form-item prop="username">
					<el-input v-model="ruleForm.username" placeholder="username">
					</el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input type="password" placeholder="password" v-model="ruleForm.password"
										@keyup.enter.native="submitForm('ruleForm')">
					</el-input>
				</el-form-item>
				<div class="login-btn">
					<el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
				</div>
				<div class="reg-btn">
					<!--					<a href="http://www.bootcss.com/" class="button button-glow button-rounded button-raised button-primary">Go</a>-->
					<el-button type="primary" @click="goRegister">注册</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		name: "login",
		data() {
			return {
				ruleForm: {
					username: 'admin',
					password: '123456'
				},
				rules: {
					username: [
						{required: true, message: '请输入用户名', trigger: 'blur'},
						{min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'},
						{validator: this.isExistUsername, trigger: 'blur'}
					],
					password: [
						{required: true, message: '请输入密码', trigger: 'blur'},
						{pattern: /^(\w){6,12}$/, message: '只能输入6-12个字母、数字、下划线'}
					]
				}
			}
		},
		beforeCreate() {
			let token = this.$cookies.get("token");
			if (token) {
				this.$ajax.request({
					method: this.$ajax.method.GET,
					url: "/api/user/token",
					success: res => {
						let username = res.headers.current_user;
						if (username) {
							this.$store.dispatch('init', username).then(() => {
								this.$router.push('/welcome');
							}).catch(() => {
								console.error("无法找到用户");
							});
						} else {
							this.$cookies.remove("token");
							throw new Error("无法获取token的用户名")
						}
					},
					error: err => {
						this.$cookies.remove("token");
						console.error(err);
					}
				})
			}
		},
		methods: {
			isExistUsername(rule, value, callback) {
				let options = {
					url: '/api/user/count',
					method: this.$ajax.method.GET,
					params: {
						model: {
							username: this.ruleForm.username
						}
					},
					success: res => {
						let status = res.status;
						if (status === 200) {
							callback();
						}
					},
					error: error => {
						let status = error.status;
						if (status === 404) {
							callback(new Error('不存在此用户名'));
						} else {
							callback(new Error('未知错误'));
						}
					}
				};
				this.$ajax.request(options);
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						let options = {
							url: "/api/user/count",
							method: this.$ajax.method.GET,
							params: {
								model: {
									username: this.ruleForm.username,
									password: this.ruleForm.password
								}
							},
							loadingOptions: {
								loading: true,
								text: "正在登录",
								time: 0.2
							},
							success: res => {
								let status = res.status;
								if (status === 200) {
									this.$store.dispatch('init', this.ruleForm.username).then(() => {
										this.$router.push('/welcome');
									}).catch(() => {
										this.$message.warning("无法初始化用户");
									});
								}
							},
							error: error => {
								let status = error.status;
								if (status === 404) {
									callback(new Error('密码错误'));
								} else {
									callback(new Error('未知错误'));
								}
							}
						};
						this.$ajax.request(options);
					} else {
						return false;
					}
				})
			},
			goRegister() {
				this.$router.push('/register');
			}
		}
	}

</script>

<style lang="less" scoped>
	.login-wrap {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.ms-title {
		position: absolute;
		top: 50%;
		width: 100%;
		margin-top: -230px;
		text-align: center;
		font-size: 30px;
		color: #fff;
	}

	.ms-login {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 300px;
		height: 180px;
		margin: -150px 0 0 -190px;
		padding: 40px;
		border-radius: 5px;
		background: #fff;
	}

	.login-btn {
		text-align: center;
	}

	.login-btn button {
		width: 100%;
		height: 36px;

		font-size: 14px;
		background-image: linear-gradient(-180deg, #409EFF, #4b6ade 90%);
		/*background-position: -.5em;*/
		border-color: rgba(27, 31, 35, .5);

		&:hover {
			background-image: linear-gradient(-180deg, #4b6ade, #4b6ade 90%);
		}
	}

	.reg-btn {
		margin-top: 15px;
		text-align: center;
	}

	.reg-btn button {
		width: 100%;
		height: 36px;

		font-size: 14px;
		background-image: linear-gradient(-180deg, #2fcb53, #269f42 90%);
		background-position: -.5em;
		border-color: rgba(27, 31, 35, .5);

		&:hover {
			background-image: linear-gradient(-180deg, #269f42, #269f42 90%);
		}
	}

</style>