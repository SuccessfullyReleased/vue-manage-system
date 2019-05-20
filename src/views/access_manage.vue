<template>
	<div>
		<div class="container">
			<div class="handle-box">

				<el-autocomplete class="input_25 mgn_20" placeholder="筛选关键词" v-model="searchControl.keyWord"
												 value-key="rolename" :fetch-suggestions="querySearchAsync" :disabled="editable">
					<template slot="prepend">角色名</template>
				</el-autocomplete>


				<el-button v-if="!editable" class="mgn_20" type="primary" icon="el-icon-edit"
									 :disabled="operationControl.update||!searchControl.isCorrect" @click="handleUpdate">
					修改
				</el-button>
				<el-button v-else class="mgn_20" type="success" icon="el-icon-check" @click="handleSave">
					保存
				</el-button>

				<el-button v-show="editable" icon="el-icon-close" @click="handleClose">
					取消
				</el-button>

			</div>
			<el-tree :data="accessTree" :props="defaultProps" show-checkbox
							 default-expand-all highlight-current
							 node-key="aid" ref="tree"></el-tree>
		</div>
	</div>
</template>

<script>
	import treeDao from "@components/tree"

	export default {
		name: "access_manage",
		data() {
			return {
				user: null,
				operationControl: {
					update: false
				},
				searchControl: {
					roleOptions: null,
					roleTree: null,
					keyWord: '',
					isCorrect: false,
				},
				accessTree: null,
				defaultProps: {
					children: 'children',
					label: 'nodename'
				},
				editable: false,
				temp: null
			};
		},
		watch: {
			"searchControl.keyWord"() {
				this.handleKeyWordChange();
			}
		},
		mounted() {
			this.user = this.$store.getters.getUser;
			this.searchControl.roleOptions = this.$store.getters.getRoleOptions;
			this.searchControl.roleTree = this.$store.getters.getRoleTree;
			this.accessTree = this.$store.getters.getAccessTree;
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "access_update") === -1) {
				this.operationControl.update = true;
			}
		},
		beforeRouteEnter(to, from, next) {
			if (from.name === "role_manage" && to.params.rid) {
				next(vm => vm.setData(to.params.rid));
			} else {
				next();
			}
		},
		beforeRouteLeave(to, from, next) {
			if (this.editable) {
				this.$confirm('系统可能不会保存您所做的更改, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.handleClose();
					next();
				}).catch(() => {
					next(false);
				});
			} else {
				next();
			}
		},
		methods: {
			setData(rid) {
				this.searchControl.roleOptions.forEach((value, index, array) => {
					if (value.rid === rid) {
						this.searchControl.keyWord = value.rolename;
					}
				});
			},
			querySearchAsync(keyWord, callback) {
				let results = keyWord.trim() ?
					this.searchControl.roleOptions.filter(this.createStateFilter(keyWord.trim()))
					: this.searchControl.roleOptions;
				callback(results);
			},
			createStateFilter(queryString) {
				return (state) => {
					return (state.rolename.toLowerCase().indexOf(queryString.toLowerCase()) !== -1);
				};
			},
			handleKeyWordChange() {
				this.searchControl.isCorrect = false;
				this.searchControl.isCorrect = this.$lodash.findIndex(this.searchControl.roleOptions, role =>
					role.rolename === this.searchControl.keyWord) !== -1;
				if (this.searchControl.isCorrect) {
					this.requireRoleData();
				} else {
					this.setCheckedKeys([]);
				}
			},
			setCheckedKeys(array) {
				this.$refs.tree.setCheckedKeys(array);
			},
			getCheckedKeys() {
				return this.$refs.tree.getCheckedKeys();
			},
			isInTree(rid) {
				let path = treeDao.findNodePath(this.searchControl.roleTree, "rid", rid);
				for (const rootNode of this.user.roleTree) {
					let index = this.$lodash.findIndex(path, role => role.rid === rootNode.rid);
					if (index !== -1 && index !== path.length - 1) {
						return true;
					}
				}
				return false;
			},
			handleUpdate() {
				let role = this.$lodash.find(this.searchControl.roleOptions, role => role.rolename === this.searchControl.keyWord);
				if (!this.isInTree(role.rid)) {
					this.$message.warning(`权限不足以修改${role.rolename}`);
					return;
				}
				this.editable = true;
				treeDao.traverseTree(this.accessTree, res => {
					res.disabled = false;
				});
				this.temp = this.getCheckedKeys();
			},
			handleSave() {
				let params = {
					rid: this.searchControl.roleOptions[this.$lodash.findIndex(this.searchControl.roleOptions, role =>
						this.searchControl.keyWord === role.rolename)].rid,
					accesses: null
				};

				if (treeDao.findNodePath(this.user.roleTree, "rid", params.rid).length < 2) {
					this.$message.warning(`权限不足以修改${this.searchControl.keyWord}`);
					this.handleClose();
					return;
				}

				let aids = this.getCheckedKeys();
				if (this.$lodash.difference(this.temp, aids).length === this.$lodash.difference(aids, this.temp).length === 0) {
					this.editable = false;
					treeDao.traverseTree(this.accessTree, res => {
						res.disabled = true;
					});
					this.$message.success("未修改");
					this.temp = null;
				} else {
					let temp = aids.concat();
					for (const aid of aids) {
						temp = temp.concat(treeDao.findNodePath(this.accessTree, "aid", aid).map(access => access.aid));
					}
					aids = this.$lodash.uniq(temp);
					params.accesses = aids.map(aid => ({aid: aid}));

					let options = {
						url: "/api/role",
						method: this.$ajax.method.PUT,
						data: params,
						success: () => {
							this.editable = false;
							treeDao.traverseTree(this.accessTree, res => {
								res.disabled = true;
							});
							this.$message.success("保存成功");
							this.temp = null;
						}
					};
					this.$ajax.request(options);
				}
			},
			handleClose() {
				this.editable = false;
				treeDao.traverseTree(this.accessTree, res => {
					res.disabled = true;
				});
				this.setCheckedKeys(this.temp);
				this.temp = null;
			},

			requireRoleData() {
				let options = {
					url: `/api/role`,
					method: this.$ajax.method.GET,
					params: {
						model: {
							rolename: this.searchControl.keyWord
						}
					},
					success: res => {
						let checked = res.data.accesses.map(access => access.aid);
						this.setCheckedKeys(checked);
					}
				};
				this.$ajax.request(options);
			}
		}
	}
</script>

<style scoped>

	.handle-box {
		margin-bottom: 20px;
	}

	.input_25 {
		width: 25%
	}

	.mgn_20 {
		margin-left: 20px;
	}

</style>