<template>
	<div class="set-wrap">
		<div class="set-title">账户中心</div>

		<div class="set-user-info">
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
					<el-button type="primary" @click="submitForm">保存</el-button>
					<el-button @click="close">返回</el-button>
				</el-form-item>
			</el-form>
		</div>

		<div class="set-avator">
			<el-upload
				class="set-avator-center"
				:headers="headers"
				:action="address"
				:data="{uid:form.uid}"
				show-file-list="false"
				list-type="picture"
				:on-success="uploadImageSuccess">
				<img v-if="form.avator" :src="avatorBaseUrl+form.avator" class="user-avator" alt="编辑头像">
			</el-upload>
		</div>

	</div>
</template>

<script>

	export default {
		name: "setting",
		data() {
			return {
				headers: null,
				address: "/rbac/user/avator",
				avatorBaseUrl: this.$httpUrl.remoteBaseUrl + "resource/",
				form: {
					uid: null,
					username: null,
					password: '',
					sex: '男',
					phone: null,
					mail: null,
					avator: null
				},
				rules: {
					username: [
						{required: true, message: '请输入用户名', trigger: 'blur'},
						{min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'},
						{validator: this.isExistUsername, trigger: 'blur'}
					],
					password:
						[
							{required: true, message: '请输入密码', trigger: 'blur'},
							{pattern: /^(\w){6,12}$/, message: '只能输入6-12个字母、数字、下划线', trigger: 'blur'}
						],
					sex:
						[
							{required: true, message: '请选择性别', trigger: 'blur'}
						],
					phone:
						[
							{pattern: /^[1][0-9]{10}$/, message: '请输入正确格式的手机号', trigger: 'blur'}
						],
					mail:
						[
							{
								pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
								message: '请输入正确格式的邮箱',
								trigger: 'blur'
							}
						]
				}
			}
		},
		mounted() {
			let token = this.$cookies.get("token");
			if (token) {
				this.headers = {"authorization": token};
			} else {
				this.headers = null;
			}
			let user = this.$store.getters.getUser;
			this.user = user;
			this.form.uid = user.uid;
			this.form.username = user.username;
			this.form.password = user.password;
			this.form.sex = user.sex === 0 ? '男' : '女';
			this.form.phone = user.phone;
			this.form.mail = user.mail;
			this.form.avator = user.avator;
		},
		methods: {
			isExistUsername(rule, value, callback) {
				if (this.form.username !== this.user.username) {
					let options = {
						url: '/rbac/user/count',
						method: this.$ajax.method.GET,
						params: {
							model: {
								name: this.form.username
							}
						},
						success: res => {
							let status = res.status;
							if (status === 200) {
								callback(new Error('已经存在此用户名'));
							}
						},
						error: err => {
							let status = error.status;
							if (status === 404) {
								callback();
							} else {
								callback(new Error('未知错误'));
							}
						}
					};
					this.$ajax.request(options);
				} else {
					callback();
				}
			},
			submitForm() {
				this.$refs['form'].validate((valid) => {
					if (valid) {
						let data = {};
						Object.keys(this.form).forEach((key) => {
							if (key === 'sex') {
								data[key] = this.form[key] === '男' ? 0 : 1;
							} else {
								data[key] = this.form[key];
							}
						});
						let options = {
							url: "/rbac/user",
							method: this.$ajax.method.PUT,
							data: data,
							success: () => {
								this.$message.success('保存成功');
								this.$store.dispatch('init', this.user.username).then(() => {
								});
							}
						};
						this.$ajax.request(options);
					}
				})
			},
			close() {
				this.$bus.$emit('closeTag', {
					"close": '/setting',
					"open": "/user_manage"
				});
				this.$bus.$emit('flushTable', null);
			},
			uploadImageSuccess() {
				this.$message.success('头像更新成功');
				let options = {
					url: `/rbac/user/uid/${this.form.uid}`,
					method: this.$ajax.method.GET,
					success: (res) => {
						this.user = res.data;
						this.form.avator = this.user.avator;
						this.$bus.$emit('flushAvator', this.form.avator);

						this.$store.dispatch('init', this.user.username).then(() => {
						});
					}
				};
				this.$ajax.request(options);
			}
		}
	}

</script>

<style lang="less" scoped>
	.set-wrap {
		width: 80%;
		margin: 0 auto;
		height: 100%;
	}

	.set-title {
		text-align: left;
		font-size: 30px;
		display: block;
		margin: 25px 0 25px 25px;
	}

	.set-user-info {
		width: 50%;
		float: left;
	}

	.set-avator {
		width: 50%;
		float: left;

		.set-avator-center {
			width: 240px;
			height: 200px;
			margin: 0 auto;
		}
	}

	.user-avator {
		width: 180px;
		height: 180px;
		border-radius: 50%;
		vertical-align: middle;
		horiz-align: center;
	}
</style>