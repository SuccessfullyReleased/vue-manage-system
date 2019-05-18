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
					v-model="searchControl.keyWord"
					class="input_25 mgn_20"
					placeholder="筛选关键词"
				></el-input>
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
				@sort-change='sortChange'
				@select="selectChange"
				@select-all="selectAll"
				ref="groupsTable"
				:header-cell-style="handHeaderStyle"
			>
				<el-table-column
					type="selection"
					align="center"
					width="36">
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="ugid"
					label="用户组ID"
					align="center"
				></el-table-column>
				<el-table-column
					sortable='custom'
					prop="groupname"
					label="用户组名"
					align="center"
				>
					<template slot-scope="scope">
						<el-input
							v-show="scope.row.editable"
							v-model="scope.row.groupname"
						></el-input>
						<span v-show="!scope.row.editable">{{scope.row.groupname}}</span>
					</template>
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="note"
					label="用户组描述"
					align="center"
				>
					<template slot-scope="scope">
						<el-input
							v-show="scope.row.editable"
							v-model="scope.row.note"
						></el-input>
						<span v-show="!scope.row.editable">{{scope.row.note}}</span>
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
					:page-sizes="[5, 10, 25]"
					:page-size.sync="pageControl.pageSize"
					layout="sizes, prev, pager, next, jumper"
					:total="pageControl.totalNum"
					:current-page.sync="pageControl.currentPage"
					hide-on-single-page
				>
				</el-pagination>
			</div>

		</div>

		<el-dialog title="提示" :visible.sync="deleteControl.deletable" width="300px" center>
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer" class="dialog-footer">
                <el-button @click="deleteControl.deletable = false">取 消</el-button>
                <el-button type="primary" @click="confirmDelete">确 定</el-button>
            </span>
		</el-dialog>

	</div>
</template>

<script>
	import treeDao from "@components/tree"

	export default {
		name: "group_manage",
		data() {
			return {
				user: null,
				operationControl: {
					select: false,
					insert: false,
					delete: false,
					update: false
				},
				searchControl: {
					options: [{
						value: 'ugid',
						label: '用户组ID'
					}, {
						value: 'groupname',
						label: '用户组名称'
					}, {
						value: 'note',
						label: '用户组描述'
					}],
					roleOptions: null,
					roleTree: null,
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
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "group_select") === -1) {
				this.operationControl.select = true;
			}
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "group_insert") === -1) {
				this.operationControl.insert = true;
			}
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "group_delete") === -1) {
				this.operationControl.delete = true;
			}
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "group_update") === -1) {
				this.operationControl.update = true;
			}
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
					this.handleClose(null, this.$refs.groupsTable.data[this.getRowIndex(this.editControl.index)]);
					next();
				}).catch(() => {
					next(false);
				});
			} else {
				next();
			}
		},
		methods: {
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
					url: '/api/userGroups',
					method: this.$ajax.method.GET,
					params: {
						keyColumn: null,
						key: null,
						orderColumn: this.tableControl.prop,
						order: this.tableControl.order
					},
					success: res => {
						this.tableControl.tableData = res.data;
						this.tableControl.tableData.forEach((value) => {
							this.$set(value, "editable", false);
							this.$set(value, "rolesChecked", []);
							value.rolesChecked = value.roles.map(role => role.rid);
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
			selectChange(selection, row) {
				let roleTree = treeDao.createRoleTree(row.roles);
				if (roleTree.length > 0) {
					for (const role of roleTree) {
						if (!this.isInTree(role.rid)) {
							this.$message.warning(`权限不足以删除${row.groupname}`);
							this.$refs.groupsTable.toggleRowSelection(row, false);
							return;
						}
					}
				}
				this.tableControl.selection = selection;
			},
			selectAll(selection) {
				for (const row of selection) {
					let roleTree = treeDao.createRoleTree(row.roles);
					if (roleTree.length > 0) {
						for (const role of roleTree) {
							if (!this.isInTree(role.rid)) {
								this.$message.warning(`权限不足以删除${row.groupname}`);
								this.$refs.groupsTable.toggleRowSelection(row, false);
								break;
							}
						}
					}
				}
				this.tableControl.selection = selection;
			},
			handHeaderStyle() {
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
					if (key !== 'editable' && key !== 'roles') {
						params[key] = row[key];
						if (row[key] !== this.editControl.temp[key]) {
							isUpdate = true;
						}
					}
				});
				params.roles = row.rolesChecked.map(checked => ({rid: checked}));

				if (this.editControl.isPlus) {
					if (isUpdate) {
						let options = {
							url: "/api/userGroup",
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
							url: "/api/userGroup",
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
				let roleTree = treeDao.createRoleTree(row.roles);
				if (roleTree.length > 0) {
					for (const role of roleTree) {
						if (!this.isInTree(role.rid)) {
							this.$message.warning(`权限不足以修改${row.groupname}`);
							return;
						}
					}
				}
				row.editable = true;
				let params = this.$lodash.omit(row, ['editable']);
				this.setEditStatus(true, false, this.getIndex(index), params);
			},
			handleInsert() {
				this.tableControl.tableData.push({
					ugid: null,
					groupname: null,
					note: null,
					roles: [],
					editable: true
				});
				this.locatePage(this.tableControl.tableData.length - 1);
				this.setEditStatus(true, true, this.tableControl.tableData.length - 1, {
					ugid: null,
					groupname: null,
					note: null,
					roles: [],
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
				let roleTree = treeDao.createRoleTree(row.roles);
				if (roleTree.length > 0) {
					for (const role of roleTree) {
						if (!this.isInTree(role.rid)) {
							this.$message.warning(`权限不足以删除${row.groupname}`);
							return;
						}
					}
				}
				this.setDeleteStatus(true, false, this.getIndex(index), row, null);
			},
			handleLargeDelete() {
				this.setDeleteStatus(true, true, null, null, this.tableControl.selection);
			},
			confirmDelete() {
				if (this.deleteControl.isLarge) {
					let options = {
						url: '/api/userGroups',
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
					let options = {
						url: `/api/userGroup/ugid/${this.deleteControl.deleteRow.ugid}`,
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
					};
					this.$ajax.request(options);
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