<template>
	<div>
		<div class="container">
			<div class="handle-box">
				<el-select v-model="searchControl.choice" placeholder="请选择" value="" clearable @change="handleChoiceChange">
					<el-option
						v-for="item in searchControl.options"
						:key="item.value"
						:label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
				<el-input
					v-if="searchControl.choice!=='sex'&&searchControl.choice!=='rolename'&&searchControl.choice!=='groupname'"
					v-model="searchControl.keyWord"
					class="input_25 mgn_20"
					placeholder="筛选关键词"
				></el-input>
				<el-select
					v-else-if="searchControl.choice==='sex'" v-model="searchControl.keyWord" class="input_25 mgn_20"
					placeholder="请选择" value="" clearable>
					<el-option
						v-for="item in searchControl.sexOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
				<el-autocomplete
					v-else-if="searchControl.choice==='rolename'"
					class="input_25 mgn_20"
					placeholder="角色"
					value-key="rolename"
					v-model="searchControl.keyWord"
					:fetch-suggestions="queryRolesAsync"
				></el-autocomplete>
				<el-autocomplete
					v-else
					class="input_25 mgn_20"
					placeholder="用户组"
					value-key="groupname"
					v-model="searchControl.keyWord"
					:fetch-suggestions="queryGroupsAsync"
				></el-autocomplete>

				<el-button
					class="mgn_20"
					type="primary"
					icon="el-icon-search"
					:disabled="operationControl.select"
					@click="requireData"
				>搜索
				</el-button>
				<el-button
					class="mgn_20"
					icon="el-icon-plus"
					@click="handleInsert"
					:disabled="operationControl.insert||editControl.editable"
				>添加
				</el-button>
				<el-button
					class="mgn_20"
					type="danger"
					icon="el-icon-delete"
					:disabled="operationControl.delete"
					@click="handleLargeDelete"
				>批量删除
				</el-button>
			</div>

			<el-table
				class="el-table-font"
				:data="pageData"
				border
				stripe
				fit
				@sort-change='sortChange'
				@select="selectChange"
				@select-all="selectAll"
				ref="usersTable"
				:header-cell-style="handleHeaderStyle"
			>
				<el-table-column
					type="selection"
					align="center"
					width="36">
				</el-table-column>
				<el-table-column
					prop="avator"
					label="头像"
					width="60"
				>
					<template slot-scope="scope">
						<div class="user-avator">
							<img :src="avatorBaseUrl+scope.row.avator"
									 alt="demo">
						</div>
					</template>
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="username"
					label="用户名"
					align="center"
				>
					<template slot-scope="scope">
						<el-input
							v-show="scope.row.editable"
							v-model="scope.row.username"
						></el-input>
						<span v-show="!scope.row.editable">{{scope.row.username}}</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="password"
					label="密码"
					align="center"
					v-if="editControl.editable"
				>
					<template slot-scope="scope">
						<el-input
							type="password"
							show-password
							v-show="scope.row.editable"
							v-model="scope.row.password"
						></el-input>
						<span v-show="!scope.row.editable">{{scope.row.password}}</span>
					</template>
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="sex"
					label="性别"
					align="center"
					width="120"
				>
					<template slot-scope="scope">
						<el-select
							v-show="scope.row.editable" v-model="scope.row.sex" value="">
							<el-option
								v-for="item in searchControl.sexOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							>
							</el-option>
						</el-select>
						<span v-show="!scope.row.editable">{{sexToText(scope.row.sex)}}</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="userGroups"
					label="用户组"
					align="center"
				>
					<template slot-scope="scope">
						<el-select v-show="scope.row.editable" multiple v-model="scope.row.userGroupsChecked">
							<el-option
								v-for="item in searchControl.userGroupOptions"
								:key="item.ugid"
								:label="item.groupname"
								:value="item.ugid"
								:disabled="item.disabled">
							</el-option>
						</el-select>
						<div v-show="!scope.row.editable" v-html="userGroupsToText(scope.row.userGroups)"></div>
					</template>
				</el-table-column>
				<el-table-column
					prop="roles"
					label="角色"
					align="center"
				>
					<template slot-scope="scope">
						<el-select v-show="scope.row.editable" multiple v-model="scope.row.rolesChecked">
							<el-option
								v-for="item in searchControl.roleOptions"
								:key="item.rid"
								:label="item.rolename"
								:value="item.rid"
								:disabled="item.disabled">
							</el-option>
						</el-select>
						<div v-show="!scope.row.editable" v-html="rolesToText(scope.row.roles)"></div>
					</template>
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="phone"
					label="联系方式"
					align="center"
				>
					<template slot-scope="scope">
						<el-input
							v-show="scope.row.editable"
							v-model="scope.row.phone"
						></el-input>
						<span v-show="!scope.row.editable">{{scope.row.phone}}</span>
					</template>
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="mail"
					label="邮箱"
					align="center"
				>
					<template slot-scope="scope">
						<el-input
							v-show="scope.row.editable"
							v-model="scope.row.mail"
						></el-input>
						<span v-show="!scope.row.editable">{{scope.row.mail}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div v-show="scope.row.editable">
							<el-button v-show="scope.row.editable" type="text" icon="el-icon-check" class="save"
												 @click="handleSave(scope.$index, scope.row)">
								保存
							</el-button>
							<el-button v-show="scope.row.editable" type="text" icon="el-icon-close" class="edit"
												 @click="handleClose(scope.$index, scope.row)">
								取消
							</el-button>
						</div>
						<div v-show="!scope.row.editable">
							<el-button type="text" icon="el-icon-edit" class="edit"
												 :disabled="operationControl.update||editControl.editable"
												 @click="handleEdit(scope.$index, scope.row)">
								编辑
							</el-button>
							<el-button type="text" icon="el-icon-delete" class="delete" :disabled="operationControl.delete"
												 @click="handleDelete(scope.$index, scope.row)">
								删除
							</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination">
				<el-pagination
					:page-sizes="[5, 10, 25, 50, 100]"
					:page-size.sync="pageControl.pageSize"
					layout="sizes, prev, pager, next, jumper"
					:total="pageControl.totalNum"
					:current-page.sync="pageControl.currentPage"
					hide-on-single-page
				>
				</el-pagination>
			</div>

		</div>

		<el-dialog title="删除提示" :visible.sync="deleteControl.deletable" width="300px" center>
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer" class="dialog-footer">
                <el-button @click="deleteControl.deletable = false">取 消</el-button>
                <el-button type="danger" @click="confirmDelete">确 定</el-button>
            </span>
		</el-dialog>

	</div>
</template>

<script>
	import treeDao from "@components/tree"

	export default {
		name: "user_manage",
		data() {
			return {
				avatorBaseUrl: this.$httpUrl.rbac + "avators/",
				user: null,
				operationControl: {
					select: false,
					insert: false,
					delete: false,
					update: false
				},
				searchControl: {
					options: [{
						value: 'username',
						label: '用户名'
					}, {
						value: 'sex',
						label: '性别'
					}, {
						value: 'groupname',
						label: '用户组'
					}, {
						value: 'rolename',
						label: '角色'
					}, {
						value: 'phone',
						label: '联系方式'
					}, {
						value: 'mail',
						label: '邮箱'
					}],
					sexOptions: [
						{
							value: '0',
							label: '男'
						}, {
							value: '1',
							label: '女'
						},
					],
					roleOptions: null,
					roleTree: null,
					userGroupOptions: null,
					choice: null,
					keyWord: null,
				},
				tableControl: {
					tableData: [],
					prop: null,
					order: null,
					selection: null
				},
				editControl: {
					editable: false,
					isPlus: false,
					index: null,
					temp: null
				},
				deleteControl: {
					deletable: false,
					isLarge: false,
					index: null,
					deleteRow: null,
					deleteRows: null
				},
				pageControl: {
					totalNum: 0,
					currentPage: 1,
					pageSize: 5
				}
			}
		},
		computed: {
			pageData() {
				return this.tableControl.tableData.slice((this.pageControl.currentPage - 1) *
					this.pageControl.pageSize, this.pageControl.currentPage * this.pageControl.pageSize);
			}
		},
		created() {
			this.$bus.$on('flushTable', () => {
				this.requireData();
			});
		},
		mounted() {
			this.user = this.$store.getters.getUser;
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "user_select") === -1) {
				this.operationControl.select = true;
			}
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "user_insert") === -1) {
				this.operationControl.insert = true;
			}
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "user_delete") === -1) {
				this.operationControl.delete = true;
			}
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "user_update") === -1) {
				this.operationControl.update = true;
			}

			this.searchControl.userGroupOptions = this.$store.getters.getUserGroupOptions;
			this.searchControl.userGroupOptions.forEach((value) => {
				if (this.$lodash.findIndex(this.user.userGroups, userGroup => userGroup.ugid === value.ugid) !== -1) {
					this.$set(value, "disabled", false);
				} else {
					this.$set(value, "disabled", true);
				}
			});

			this.searchControl.roleTree = this.$store.getters.getRoleTree;
			this.searchControl.roleOptions = this.$store.getters.getRoleOptions;
			this.searchControl.roleOptions.forEach((value) => {
				if (value.rolename === "超级管理员") {
					this.$set(value, "disabled", true);
				} else {
					if (this.$lodash.findIndex(this.user.total_roles, role => role.rid === value.rid) !== -1) {
						this.$set(value, "disabled", false);
					} else {
						this.$set(value, "disabled", true);
					}
				}
			});
		},
		beforeRouteLeave(to, from, next) {
			if (this.editControl.editable) {
				this.$confirm('系统可能不会保存您所做的更改, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.handleClose(null, this.$refs.usersTable.data[this.getRowIndex(this.editControl.index)]);
					next();
				}).catch(() => {
					next(false);
				});
			} else {
				next();
			}
		},
		methods: {
			sexToText(sex) {
				return sex = sex === '0' ? '男' : '女';
			},
			userGroupsToText(userGroups) {
				let text = '';
				for (let i = 0; i < userGroups.length; i++) {
					if (i !== 0) {
						text += '<br/>';
						text += userGroups[i].groupname;
					} else {
						text += userGroups[i].groupname;
					}
				}
				return text;
			},
			rolesToText(roles) {
				let text = '';
				for (let i = 0; i < roles.length; i++) {
					if (i !== 0) {
						text += '<br/>';
						text += roles[i].rolename;
					} else {
						text += roles[i].rolename;
					}
				}
				return text;
			},
			handleChoiceChange() {
				this.searchControl.keyWord = null;
			},
			queryGroupsAsync(keyWord, callback) {
				keyWord = keyWord ? keyWord : '';
				let results = keyWord.trim() ?
					this.searchControl.userGroupOptions.filter(this.createRolesFilter(keyWord.trim()))
					: this.searchControl.userGroupOptions;
				callback(results);
			},
			queryRolesAsync(keyWord, callback) {
				keyWord = keyWord ? keyWord : '';
				let results = keyWord.trim() ?
					this.searchControl.roleOptions.filter(this.createRolesFilter(keyWord.trim()))
					: this.searchControl.roleOptions;
				callback(results);
			},
			createRolesFilter(queryString) {
				return (state) => {
					return (state.rolename.toLowerCase().indexOf(queryString.toLowerCase()) !== -1);
				};
			},
			getIndex(rowIndex) {
				return (this.pageControl.currentPage - 1) * this.pageControl.pageSize + rowIndex;
			},
			getRowIndex(index) {
				return index % this.pageControl.pageSize;
			},
			getPage(index) {
				return Math.floor(index / this.pageControl.pageSize) + 1;
			},
			locatePage(index) {
				this.pageControl.totalNum = this.tableControl.tableData.length;
				if (index >= this.pageControl.totalNum) {
					throw new Error(`Array index : ${index} is out of bounds : ${this.pageControl.totalNum}`);
				} else {
					this.pageControl.currentPage = this.getPage(index);
				}
			},
			requireData() {
				let options = {
					url: '/rbac/users',
					method: this.$ajax.method.GET,
					params: {
						keyColumn: null,
						key: null,
						orderColumn: this.tableControl.prop,
						order: this.tableControl.order
					},
					success: res => {
						this.tableControl.tableData = res.data;
						this.tableControl.tableData.forEach((value, index, array) => {
							value.sex = String(value.sex);
							this.$set(value, "editable", false);
							this.$set(value, "rolesChecked", []);
							value.rolesChecked = value.roles.map(role => role.rid);
							this.$set(value, "userGroupsChecked", []);
							value.userGroupsChecked = value.userGroups.map(userGroup => userGroup.ugid);
						});
						this.pageControl.totalNum = this.tableControl.tableData.length;
					},
					loadingOptions: {
						loading: true,
						text: "正在获取数据",
						time: 0.2
					}
				};
				if (this.searchControl.choice && this.searchControl.keyWord) {
					options.params.keyColumn = this.searchControl.choice;
					options.params.key = this.searchControl.keyWord;
				}
				this.$ajax.request(options);
			},
			sortChange(column) {
				if (column.prop == null) {
					this.tableControl.prop = null;
				} else {
					this.tableControl.prop = column.prop;
				}
				switch (column.order) {
					case "ascending":
						this.tableControl.order = 'asc';
						break;
					case "descending":
						this.tableControl.order = 'desc';
						break;
					default:
						this.tableControl.order = null;
						break;
				}
				this.requireData()
			},

			selectChange(selection, row) {
				if (this.$lodash.find(selection, user => user.uid === row.uid)) {
					let total = row.roles.concat();
					this.$ajax.request({
						method: this.$ajax.method.POST,
						url: "/rbac/userGroups/roles",
						data: row.userGroups,
						success: res => {
							total = this.$lodash.uniqBy(total.concat(res.data), "rid");
							treeDao.can(this.searchControl.roleTree, this.user.roleTree, total, () => {
								this.tableControl.selection = selection;
							}, role => {
								this.$message.warning(`权限不足以更改${role.rolename}`);
								this.$refs.usersTable.toggleRowSelection(row, false);
							});
						}
					});
				} else {
					this.tableControl.selection = selection;
				}
			},
			selectAll(selection) {
				for (const row of selection) {
					this.selectChange(selection, row);
				}
			},
			handleHeaderStyle() {
				return {
					"text-align": "center",
					"color": "black",
					"font-size": "14px"
				}
			},

			setEditStatus(editable, isPlus, index, temp) {
				this.editControl.editable = editable;
				this.editControl.isPlus = isPlus;
				this.editControl.index = index;
				this.editControl.temp = temp;
			},
			handleSave(index, row) {
				let params = {};
				let isUpdate = false;
				Object.keys(row).forEach((key) => {
					if (key !== 'editable' && key !== 'userGroups' && key !== 'roles') {
						params[key] = row[key];
						if (row[key] !== this.editControl.temp[key]) {
							isUpdate = true;
						}
					}
				});

				params.roles = row.rolesChecked.map(checked => ({rid: checked}));
				params.userGroups = row.userGroupsChecked.map(checked => ({ugid: checked}));
				if (this.editControl.isPlus) {
					if (isUpdate) {
						let options = {
							url: "/rbac/user",
							method: this.$ajax.method.POST,
							data: params,
							success: () => {
								this.$message.success('保存成功');
								this.requireData();
								row.editable = false;
								this.setEditStatus(false, false, null, null);
							}
						};
						this.$ajax.request(options);
					} else {
						this.$message.warning('未填写有效信息');
						row.editable = false;
						this.setEditStatus(false, false, null, null);
					}
				} else {
					if (isUpdate) {
						let options = {
							url: "/rbac/user",
							method: this.$ajax.method.PUT,
							data: params,
							success: () => {
								this.$message.success('保存成功');
								this.requireData();
								row.editable = false;
								this.setEditStatus(false, false, null, null);
							}
						};
						this.$ajax.request(options);
					} else {
						this.$message.success('未修改');
						row.editable = false;
						this.setEditStatus(false, false, null, null);
					}
				}
			},
			handleClose(index, row) {
				row.editable = false;
				if (this.editControl.isPlus) {
					this.tableControl.tableData.pop();
					if (this.tableControl.tableData.length > 0)
						this.locatePage(this.tableControl.tableData.length - 1);
				} else {
					Object.keys(row).forEach((key) => {
						if (key !== 'editable') {
							row[key] = this.editControl.temp[key];
						}
					});
				}
				this.setEditStatus(false, false, null, null);
			},
			handleEdit(index, row) {
				let total = row.roles.concat();
				if (row.userGroups.length > 0) {
					this.$ajax.request({
						method: this.$ajax.method.POST,
						url: "/rbac/userGroups/roles",
						data: row.userGroups,
						success: res => {
							total = this.$lodash.uniqBy(total.concat(res.data), "rid");
							treeDao.can(this.searchControl.roleTree, this.user.roleTree, total, () => {
								row.editable = true;
								let params = this.$lodash.omit(row, ['editable']);
								this.setEditStatus(true, false, this.getIndex(index), params);
							}, role => {
								this.$message.warning(`权限不足以修改${role.rolename}`);
							});
						}
					});
				} else {
					treeDao.can(this.searchControl.roleTree, this.user.roleTree, total, () => {
						row.editable = true;
						let params = this.$lodash.omit(row, ['editable']);
						this.setEditStatus(true, false, this.getIndex(index), params);
					}, role => {
						this.$message.warning(`权限不足以修改${role.rolename}`);
					});
				}

			},
			handleInsert() {
				this.tableControl.tableData.push({
					uid: null,
					username: null,
					password: null,
					sex: null,
					roles: [],
					rolesChecked: [],
					userGroups: [{ugid: 3}],
					userGroupsChecked: [3],
					phone: null,
					mail: null,
					avator: '1.png',
					editable: true
				});
				this.locatePage(this.tableControl.tableData.length - 1);
				this.setEditStatus(true, true, this.tableControl.tableData.length - 1, {
					uid: null,
					username: null,
					password: null,
					sex: null,
					roles: [],
					rolesChecked: [],
					userGroups: [{ugid: 3}],
					userGroupsChecked: [3],
					phone: null,
					mail: null,
					avator: '1.png',
					editable: true
				});
			},

			setDeleteStatus(deletable, isLarge, index, deleteRow, deleteRows) {
				this.deleteControl.deletable = deletable;
				this.deleteControl.isLarge = isLarge;
				this.deleteControl.index = index;
				this.deleteControl.deleteRow = deleteRow;
				this.deleteControl.deleteRows = deleteRows;
			},
			handleDelete(index, row) {
				let total = row.roles.concat();
				this.$ajax.request({
					method: this.$ajax.method.POST,
					url: "/rbac/userGroups/roles",
					data: row.userGroups,
					success: res => {
						total = this.$lodash.uniqBy(total.concat(res.data), "rid");
						treeDao.can(this.searchControl.roleTree, this.user.roleTree, total, () => {
							this.setDeleteStatus(true, false, this.getIndex(index), row, null);
						}, role => {
							this.$message.warning(`权限不足以删除${role.rolename}`);
						});
					}
				});
			},
			handleLargeDelete() {
				this.setDeleteStatus(true, true, null, null, this.tableControl.selection);
			},
			confirmDelete() {
				if (this.deleteControl.isLarge) {
					let options = {
						url: '/rbac/users',
						method: this.$ajax.method.DELETE,
						data: this.deleteControl.deleteRows,
						success: () => {
							this.setDeleteStatus(false, false, null, null, null);
							this.requireData();
							this.$message.success('删除成功');
						},
						error: () => {
							this.setDeleteStatus(false, false, null, null, null);
							this.requireData();
							this.$message.error('删除失败');
						}
					};
					this.$ajax.request(options);
				} else {
					this.$ajax.request({
						url: `/rbac/user/uid/${this.deleteControl.deleteRow.uid}`,
						method: this.$ajax.method.DELETE,
						success: () => {
							this.setDeleteStatus(false, false, null, null, null);
							this.requireData();
							this.$message.success('删除成功');
						},
						error: () => {
							this.setDeleteStatus(false, false, null, null, null);
							this.requireData();
							this.$message.error('删除失败');
						}
					});
				}
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

	.user-avator {
		width: 40px;
		height: 40px;
		margin: 0 auto;
	}

	.user-avator img {
		display: block;
		width: 40px;
		height: 40px;
		border-radius: 50%;
	}

	.el-table-font {
		width: 100%;
		font-size: 14px;
	}

	.save {
		color: #67c23a;
		font-size: 14px;
	}

	.edit {
		font-size: 14px;
	}

	.delete {
		color: #ff0000;
		font-size: 14px;
	}

</style>