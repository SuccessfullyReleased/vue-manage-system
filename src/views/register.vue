<template>
	<div class="reg-wrap">
		<div class="reg-title">注册</div>

		<el-form ref="form" :rules="rules" :model="form" label-width="80px">
			<el-form-item prop="username" label="用户名">
				<el-input v-model="form.username" placeholder="Username"></el-input>
			</el-form-item>
			<el-form-item prop="password" label="密码">
				<el-input v-model="form.password" placeholder="Password" show-password></el-input>
			</el-form-item>
			<el-form-item prop="sex" label="性别">
				<el-radio-group v-model="form.sex">
					<el-radio label="男"></el-radio>
					<el-radio label="女"></el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item prop="phone" label="手机">
				<el-input v-model="form.phone" placeholder="非必填"></el-input>
			</el-form-item>
			<el-form-item prop="mail" label="邮箱">
				<el-input v-model="form.mail" placeholder="非必填"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="submitForm">立即注册</el-button>
				<el-button @click="goBack">取消</el-button>
			</el-form-item>
		</el-form>

	</div>
</template>

<script>
	export default {
		name: "register",
		data() {
			return {
				form: {
					username: null,
					password: '',
					sex: '男',
					phone: null,
					mail: null
				},
				rules: {
					username: [
						{required: true, message: '请输入用户名', trigger: 'blur'},
						{min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'},
						{validator: this.isExistUsername, trigger: 'blur'}
					],
					password: [
						{required: true, message: '请输入密码', trigger: 'blur'},
						{pattern: /^(\w){6,12}$/, message: '只能输入6-12个字母、数字、下划线', trigger: 'blur'}
					],
					sex: [
						{required: true, message: '请选择性别', trigger: 'blur'}
					],
					phone: [
						{pattern: /^[1][0-9]{10}$/, message: '请输入正确格式的手机号', trigger: 'blur'}
					],
					mail: [
						{
							pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
							message: '请输入正确格式的邮箱',
							trigger: 'blur'
						}
					]
				}
			}
		},
		methods: {
			isExistUsername(rule, value, callback) {
				let options = {
					url: '/rbac/user/count',
					method: this.$ajax.method.GET,
					params: {
						model: {
							username: this.form.username
						}
					},
					success: res => {
						let status = res.status;
						if (status === 200) {
							callback(new Error('已经存在此用户名'));
						}
					},
					error: error => {
						let status = error.status;
						if (status === 404) {
							callback();
						} else {
							callback(new Error('未知错误'));
						}
					}
				};
				this.$ajax.request(options);
			},
			submitForm() {
				this.$refs['form'].validate((valid) => {
					if (valid) {
						let options = {
							url: '/rbac/user',
							method: 'POST',
							data: {
								username: this.form.username,
								password: this.form.password,
								sex: this.form.sex === '男' ? 0 : 1,
								phone: this.form.phone,
								mail: this.form.mail
							},
							auth: false,
							success: () => {
								this.$message.success('注册成功');
								this.$router.push('/login');
							},
							loadingOptions: {
								loading: true,
								text: '注册中',
								time: 0.2
							}
						};
						this.$ajax.request(options);
					} else {
						return false;
					}
				})
			},
			goBack() {
				this.$router.go(-1);
			}
		}
	}

</script>

<style lang="less" scoped>
	.reg-wrap {
		position: relative;
		background-color: #ffffff;
		width: 25%;
		margin: 0 auto;
		height: 100%;
	}

	.reg-title {
		text-align: left;
		font-size: 30px;
		display: block;
		margin: 25px 0 25px 25px;
	}


</style>