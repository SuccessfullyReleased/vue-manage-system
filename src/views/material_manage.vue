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
				<el-input class="input_25 mgn_20" v-model="searchControl.keyWord" placeholder="筛选关键词"/>
				<el-button class="mgn_20" type="primary" icon="el-icon-search" @click="requireData"
				>搜索
				</el-button>
				<el-button class="mgn_20" icon="el-icon-upload"
									 :disabled="operationControl.insert||editControl.editable" @click="handleInsert"
				>上传
				</el-button>
				<el-button class="mgn_20" type="danger" icon="el-icon-delete"
									 :disabled="operationControl.delete" @click="handleLargeDelete"
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
				ref="materialsTable"
				:header-cell-style="handleHeaderStyle"
			>
				<el-table-column
					type="selection"
					align="center"
					width="36">
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="title"
					label="文件名"
					align="center"/>
				<el-table-column
					sortable='custom'
					prop="type"
					label="类型"
					align="center"/>
				<el-table-column
					sortable='custom'
					prop="author"
					label="上传人"
					align="center"/>
				<el-table-column
					sortable='custom'
					prop="size"
					label="材料大小"
					align="center">
					<template slot-scope="scope">
						<span>{{getFileSize(scope.row.size)}}</span>
					</template>
				</el-table-column>
				<el-table-column
					sortable='custom'
					prop="time"
					label="上传时间"
					align="center"/>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<el-button type="text" icon="el-icon-download" class="download"
											 @click="handleDownload(scope.row)">
							下载
						</el-button>
						<el-button type="text" icon="el-icon-delete" class="delete" :disabled="operationControl.delete"
											 @click="handleDelete(scope.$index, scope.row)">
							删除
						</el-button>
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

		<el-dialog title="上传" :visible.sync="editControl.editable" width="400px" center>
			<div>
				<el-select class="mgnB_20"
									 v-model="editControl.uploadControl.temp.type" placeholder="类型"
									 filterable allow-create default-first-option clearable value="">
					<el-option
						v-for="item in editControl.uploadControl.options" :key="item.value" :label="item.value" :value="item.value">
					</el-option>
				</el-select>
				<el-input class="mgnB_20" type="textarea" maxlength="30" show-word-limit :rows="4"
									v-model="editControl.uploadControl.temp.note" placeholder="简述"/>
				<el-upload
					class="mgnB_20"
					ref="upload"
					:action="address"
					:headers="headers"
					:limit="editControl.uploadControl.limit"
					show-file-list
					:auto-upload="false"
					:data="{
					type:editControl.uploadControl.temp.type,
					note:editControl.uploadControl.temp.note,
					author:editControl.uploadControl.temp.author,
					}"
					:before-upload="beforeUpload"
					:on-success="handleSuccess"
					:on-error="handleError"
					:on-exceed="handleLimit">
					<i class="el-icon-upload"></i>
					<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
					<div class="el-upload__tip center" slot="tip">文件大小不超过4GB</div>
				</el-upload>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleUpload">确 定</el-button>
			</span>
		</el-dialog>

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
	import request from "@components/requests"

	export default {
		name: "material_manage",
		data() {
			return {
				headers: null,
				address: "/cms/material",
				downloadAddress: this.$httpUrl.cms + "materials/",
				user: null,
				operationControl: {
					select: false,
					insert: false,
					delete: false
				},
				searchControl: {
					options: [{
						value: 'title',
						label: '标题'
					}, {
						value: 'type',
						label: '类型'
					}, {
						value: 'author',
						label: '作者'
					}, {
						value: 'size',
						label: '大小'
					}, {
						value: 'time',
						label: '时间'
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
					uploadControl: {
						options: [{
							value: "Java"
						}, {
							value: "JavaScript"
						}, {
							value: "CSS"
						}, {
							value: "HTML"
						}, {
							value: "Python"
						}, {
							value: "C++"
						}],
						limit: 1,
						file: null,
						temp: {
							type: null,
							note: null,
							author: null,
							time: null,
						},
					}
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
			let token = this.$cookies.get("token");
			if (token) {
				this.headers = {"authorization": token};
			} else {
				this.headers = null;
			}
			this.user = this.$store.getters.getUser;

			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "material_insert") === -1) {
				this.operationControl.insert = true;
			}
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "material_delete") === -1) {
				this.operationControl.delete = true;
			}

			this.searchControl.roleOptions = this.$store.getters.getRoleOptions;
			this.searchControl.roleTree = this.$store.getters.getRoleTree;
		},
		methods: {
			getFileSize(fileByte) {
				let fileSizeByte = fileByte;
				let fileSizeMsg = "";
				if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
				else if (fileSizeByte === 1048576) fileSizeMsg = "1MB";
				else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
				else if (fileSizeByte > 1048576 && fileSizeByte === 1073741824) fileSizeMsg = "1GB";
				else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + "GB";
				else fileSizeMsg = "文件超过1TB";
				return fileSizeMsg;
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
					url: '/cms/materials',
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
							this.$set(value, "editable", false);
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
				if (this.$lodash.find(selection, material => material.mid === row.mid)) {
					if (row.author === this.user.username) {
						this.tableControl.selection = selection;
					} else {
						request.getRolesByUsername(row.author, this.searchControl.roleTree, roles => {
							treeDao.can(this.searchControl.roleTree, this.user.roleTree, roles, () => {
								this.tableControl.selection = selection;
							}, role => {
								this.$message.warning(`权限不足以更改${role.rolename}上传的文件`);
								this.$refs.materialsTable.toggleRowSelection(row, false);
							});
						});
					}
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

			setEditStatus(editable, temp) {
				this.editControl.editable = editable;
				this.editControl.uploadControl.temp = temp;
			},
			handleInsert() {
				this.setEditStatus(true, {
					type: null,
					note: null,
					author: this.user.username,
				});
			},
			handleClose() {
				this.setEditStatus(false, {
					type: null,
					note: null,
					author: this.user.username,
				});
				this.$refs.upload.clearFiles();
			},
			handleUpload() {
				this.$refs.upload.submit();
			},
			beforeUpload(file) {
				this.editControl.uploadControl.file = file;
			},
			handleSuccess(success, file) {
				this.$message.success(`文件${file.name}上传成功`);
				this.requireData();
				this.handleClose();
			},
			handleError(error, file) {
				console.error(error);
				this.$message.error(`文件${file.name}上传失败`);
				this.handleClose();
			},
			handleLimit() {
				this.$message.warning("重新上传前请删除原上传文件！");
			},

			handleDownload(row) {
				let params = {
					title: row.title,
					file: row.file
				};
				params = encodeURIComponent(JSON.stringify(params));
				console.log(params);
				let link = document.createElement('a');
				link.style.display = 'none';
				link.href = `http://localhost:9501/cms/materials/file?material=${params}`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			},

			setDeleteStatus(deletable, isLarge, index, deleteRow, deleteRows) {
				this.deleteControl.deletable = deletable;
				this.deleteControl.isLarge = isLarge;
				this.deleteControl.index = index;
				this.deleteControl.deleteRow = deleteRow;
				this.deleteControl.deleteRows = deleteRows;
			},
			handleDelete(index, row) {
				if (row.author === this.user.username) {
					this.setDeleteStatus(true, false, this.getIndex(index), row, null);
				} else {
					request.getRolesByUsername(row.author, this.searchControl.roleTree, roles => {
						treeDao.can(this.searchControl.roleTree, this.user.roleTree, roles, () => {
							this.setDeleteStatus(true, false, this.getIndex(index), row, null);
						}, role => {
							this.$message.warning(`权限不足以删除${role.rolename}上传的文件`);
						});
					});
				}
			},
			handleLargeDelete() {
				this.setDeleteStatus(true, true, null, null, this.tableControl.selection);
			},
			confirmDelete() {
				if (this.deleteControl.isLarge) {
					let options = {
						url: '/cms/materials',
						method: this.$ajax.method.DELETE,
						data: this.deleteControl.deleteRows,
						success: () => {
							this.setDeleteStatus(false, false, null, null, null);
							this.requireData();
							this.$message.success('删除成功');
						},
						error: () => {
							this.setDeleteStatus(false, false, null, null, null);
							this.$message.error('删除失败');
						}
					};
					this.$ajax.request(options);
				} else {
					let options = {
						url: `/cms/material/mid/${this.deleteControl.deleteRow.mid}`,
						method: this.$ajax.method.DELETE,
						success: () => {
							this.setDeleteStatus(false, false, null, null, null);
							this.requireData();
							this.$message.success('删除成功');
						},
						error: () => {
							this.setDeleteStatus(false, false, null, null, null);
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

	.mgnB_20 {
		margin-bottom: 20px;
	}

	.center {
		text-align: center;
	}

	.download {
		color: #67c23a;
		font-size: 14px;
	}

	.delete {
		color: #ff0000;
		font-size: 14px;
	}
</style>