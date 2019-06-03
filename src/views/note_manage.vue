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
					v-if="searchControl.choice!=='time'"
					class="input_25 mgn_20"
					placeholder="筛选关键词"
				></el-input>

				<el-date-picker
					v-model="searchControl.keyWord"
					v-else
					class="mgn_20"
					type="datetimerange"
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期">
				</el-date-picker>

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
					icon="el-icon-edit"
					@click="handleInsert"
					:disabled="operationControl.insert||editControl.editable"
				>发帖
				</el-button>
			</div>
			<el-collapse class="collapse" accordion @change="handleCollapseChange">
				<template v-for="note in data">
					<el-collapse-item :key="note.nid" :name="String(note.nid)">
						<template slot="title">
							<div class="info">
								<div class="title">
									<el-link type="primary" :underline="false" @click="handleFloor(note)">{{note.title}}</el-link>
								</div>
								<div class="btn">
									<el-button
										v-show="canDelete(note.author)"
										icon="el-icon-delete"
										type="danger"
										@click.stop="handleDeleteNote(note)"
									>删除
									</el-button>
								</div>
								<div class="text">{{note.time}}</div>
								<div class="text">{{note.author}}</div>
							</div>
						</template>
						<div class="ql-editor" v-html="note.floors[0].contentText"></div>
					</el-collapse-item>
				</template>
			</el-collapse>
		</div>

		<el-dialog class="edit-dialog" title="发帖" :visible.sync="editControl.editable"
							 :close-on-click-modal="false" width="840px" center>
			<div>
				<el-input class="mgnB_20" type="text" maxlength="50" show-word-limit
									v-model="editControl.temp.title" placeholder="添加标题">
					<template slot="prepend">标题</template>
				</el-input>
				<quill-editor ref="editor"
											v-model="editControl.temp.contentText"
											:options="editControl.editorOptions"
				>
				</quill-editor>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
			</span>
		</el-dialog>

		<el-dialog title="删除提示" :visible.sync="deleteControl.deletable" width="300px" center>
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer">
                <el-button @click="cancelDelete">取 消</el-button>
                <el-button type="danger" @click="confirmDelete">确 定</el-button>
            </span>
		</el-dialog>
	</div>
</template>

<script>
	import Quill from 'quill';
	import ImageResize from 'quill-image-resize-module'
	import treeDao from "@components/tree"

	Quill.register('modules/imageResize', ImageResize);

	export default {
		name: "note_manage",
		data() {
			return {
				user: null,
				operationControl: {
					delete: false
				},
				searchControl: {
					options: [{
						value: 'title',
						label: '标题'
					}, {
						value: 'author',
						label: '楼主'
					}, {
						value: 'time',
						label: '时间'
					}],
					roleOptions: null,
					roleTree: null,
					choice: null,
					keyWord: null,
				},
				data: null,
				editControl: {
					editorOptions: {
						modules: {
							toolbar: [
								['bold', 'italic', 'underline', 'strike'],
								['blockquote', 'code-block'],
								[{'header': 1}, {'header': 2}],
								[{'list': 'ordered'}, {'list': 'bullet'}],
								[{'script': 'sub'}, {'script': 'super'}],
								[{'indent': '-1'}, {'indent': '+1'}],
								[{'direction': 'rtl'}],
								[{'size': ['small', false, 'large', 'huge']}],
								[{'header': [1, 2, 3, 4, 5, 6, false]}],
								[{'font': []}],
								[{'color': []}, {'background': []}],
								[{'align': []}],
								['clean'],
								['link', 'image']
							],
							history: {
								delay: 1000,
								maxStack: 50,
								userOnly: false
							},
							imageResize: {
								displayStyles: {
									backgroundColor: 'black',
									border: 'none',
									color: 'white'
								},
								modules: ['Resize', 'DisplaySize', 'Toolbar']
							}
						}
					},
					editable: false,
					temp: {
						title: null,
						contentText: null
					}
				},
				deleteControl: {
					deletable: false,
					nid: null
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
			if (this.$lodash.findIndex(this.user.accesses, access => access.operation && access.operation.key === "note_delete") === -1) {
				this.operationControl.delete = true;
			}

			this.searchControl.roleOptions = this.$store.getters.getRoleOptions;
			this.searchControl.roleTree = this.$store.getters.getRoleTree;
			this.requireData();
		},
		beforeRouteLeave(to, from, next) {
			if (this.editControl.editable) {
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
			handleChoiceChange() {
				this.searchControl.keyWord = null;
			},
			requireData() {
				let options = {
					url: '/cms/notes',
					method: this.$ajax.method.GET,
					params: {
						keyColumn: null,
						key: null,
						orderColumn: "time",
						order: "desc"
					},
					success: res => {
						this.data = res.data;
					},
					loadingOptions: {
						loading: true,
						text: "正在获取数据",
						time: 0.2
					}
				};
				if (this.searchControl.choice && this.searchControl.keyWord) {
					options.params.keyColumn = this.searchControl.choice;
					if (options.params.keyColumn === "time") {
						console.log(this.searchControl.keyWord);
						options.params.key = `${this.searchControl.keyWord[0].Format("yyyy-MM-dd HH:mm:ss")}~${this.searchControl.keyWord[1].Format("yyyy-MM-dd HH:mm:ss")}`;
					} else {
						options.params.key = this.searchControl.keyWord;
					}
				}
				this.$ajax.request(options);
			},
			handleCollapseChange(nid) {
				if (nid) {

				}
			},
			canDelete(author) {
				if (author === this.user.username) {
					return true;
				} else {
					return !this.operationControl.delete;
				}
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

			setEditStatus(editable, temp = null) {
				this.editControl.editable = editable;
				if (temp) {
					this.editControl.temp = temp;
				}
			},
			handleSave() {
				let note = {
					title: this.editControl.temp.title,
					author: this.user.username,
					floors: [
						{
							contentText: this.editControl.temp.contentText,
							author: this.user.username,
						}
					]
				};
				this.$ajax.request({
					method: this.$ajax.method.POST,
					url: "/cms/note",
					data: note,
					success: () => {
						this.$message.success("发帖成功");
						this.requireData();
						this.setEditStatus(false, {
							title: null,
							contentText: null
						});
					},
					error: () => {
						this.$message.error("发帖失败");
						this.handleClose();
					}
				})
			},
			handleClose() {
				this.setEditStatus(false);
			},
			handleInsert() {
				this.setEditStatus(true);
			},


			setDeleteStatus(deletable, nid) {
				this.deleteControl.deletable = deletable;
				this.deleteControl.nid = nid;
			},
			handleDeleteNote(note) {
				if (this.user.username === note.author) {
					this.setDeleteStatus(true, note.nid);
				} else {
					this.$ajax.request({
						method: this.$ajax.method.GET,
						url: "/rbac/user",
						params: {
							model: {
								username: note.author
							}
						},
						success: res => {
							let roleTree = treeDao.createRoleTree(res.data.roles);
							let can = true;
							if (roleTree.length > 0) {
								for (const role of roleTree) {
									if (!this.isInTree(role.rid)) {
										this.$message.warning(`权限不足以删除${note.author}`);
										can = false;
										break;
									}
								}
							}
							if (can) {
								this.setDeleteStatus(true, note.nid);
							}
						}
					});
				}
			},
			cancelDelete() {
				this.setDeleteStatus(false, null);
			},
			confirmDelete() {
				this.$ajax.request({
					method: this.$ajax.method.DELETE,
					url: `/cms/note/nid/${this.deleteControl.nid}`,
					success: () => {
						this.$message.success("删除成功");
						this.requireData();
						this.cancelDelete()
					},
					error: () => {
						this.$message.error("删除失败");
						this.cancelDelete();
					}
				})
			},

			handleFloor(note) {
				this.$router.push({name: "note_content", params: {note: note}});
			}
		}
	}
</script>

<style lang="less" scoped>

	.handle-box {
		margin-bottom: 20px;

		.input_25 {
			width: 25%
		}

		.mgn_20 {
			margin-left: 20px;
		}

	}

	.collapse {

		.info {

			width: 100%;

			.title {
				float: left;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				font-size: 14px;
				margin-left: 20px;
				margin-right: 20px;
			}

			.btn {
				float: right;
				margin-right: 20px;
				min-width: 150px;
				text-align: center;
			}

			.text {
				float: right;
				font-size: 14px;
				margin-right: 20px;
				min-width: 150px;
				text-align: center;
			}

		}

	}

	.edit-dialog {
		.mgnB_20 {
			margin-bottom: 20px;
		}
	}
</style>