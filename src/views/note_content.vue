<template>
	<div>
		<div class="container">
			<el-page-header class="header" @back="goBack">
				<template slot="content">
					<div class="title">{{note.title}}</div>
					<el-button
						class="insert"
						icon="el-icon-chat-line-round"
						@click="handleInsertFloor"
						:disabled="note.title===null||editable"
					>回复
					</el-button>
				</template>
			</el-page-header>
			<div class="floors">
				<template v-for="floor in data">
					<el-card shadow="hover">
						<div class="floor" :key="floor.fid">
							<div class="user-info">
								<img :src="avatorBaseUrl+getAvator(floor.author)" class="user-avator" alt="用户头像">
								<div class="user-username"><span>{{floor.author}}</span></div>
							</div>
							<div class="content">
								<div class="ql-editor floor-content" v-html="floor.contentText"></div>
								<div class="collapse">
									<el-collapse accordion>
										<el-collapse-item :name="floor.fid">
											<template slot="title">
												<div class="info">
													<div class="btn">
														<el-button
															icon="el-icon-chat-line-round"
															@click.stop="handleInsertComment(floor.fid)"
															:disabled="editable"
														>回复
														</el-button>
													</div>
													<div class="comments">评论({{floor.comments.length}})</div>
													<div class="time">{{floor.time}}</div>
													<div class="btn">
														<el-button
															v-show="canDelete(note.author)"
															type="danger"
															icon="el-icon-delete"
															@click.stop="handleDeleteFloor(note,floor)"
															:disabled="editable"
														>删除
														</el-button>
													</div>
													<div class="btn">
														<el-button
															v-show="user.username===floor.author"
															icon="el-icon-edit"
															@click.stop="handleUpdateFloor(floor)"
															:disabled="editable"
														>重新编辑
														</el-button>
													</div>
												</div>
											</template>
											<div class="comment" v-for="comment in floor.comments" :key="comment.cid">
												<el-card shadow="hover">
													<div class="comment-body">
														<img :src="avatorBaseUrl+getAvator(comment.author)" class="user-avator" alt="用户头像">
														<div class="comment-content">
															{{getPrefix(floor.comments,comment)}}{{comment.content}}
														</div>
														<div class="btn">
															<el-button
																v-show="user.username!==comment.author"
																icon="el-icon-chat-line-round"
																@click="handleInsertComment(floor.fid,comment.cid)"
																:disabled="editable"
															>回复
															</el-button>
														</div>
														<div class="time">{{comment.time}}</div>
														<div class="btn">
															<el-button
																v-show="canDelete(note.author)"
																type="danger"
																icon="el-icon-delete"
																@click.stop="handleDeleteComment(note,comment)"
																:disabled="editable"
															>删除
															</el-button>
														</div>
														<div class="btn">
															<el-button
																v-show="user.username===comment.author"
																icon="el-icon-edit"
																@click="handleUpdateComment(comment)"
																:disabled="editable"
															>重新编辑
															</el-button>
														</div>
													</div>
												</el-card>
											</div>
										</el-collapse-item>
									</el-collapse>
								</div>
							</div>
						</div>
					</el-card>
				</template>
			</div>
		</div>

		<el-dialog title="回复" :visible.sync="editControl.floorControl.floor_editable"
							 :close-on-click-modal="false" width="840px" center>
			<quill-editor ref="editor"
										v-model="editControl.floorControl.temp.contentText"
										:options="editControl.editorOptions"
			>
			</quill-editor>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSaveFloor">确 定</el-button>
			</span>
		</el-dialog>

		<el-dialog class="edit-comment-dialog" title="评论" :visible.sync="editControl.commentControl.comment_editable"
							 :close-on-click-modal="false" width="500px" center>
			<el-input class="mgnB_20" type="textarea" maxlength="50" show-word-limit :rows="4"
								v-model="editControl.commentControl.temp.content" placeholder="添加评论">
			</el-input>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSaveComment">确 定</el-button>
			</span>
		</el-dialog>

		<el-dialog title="删除提示" :visible.sync="deleteControl.deletable" width="300px" center
							 @close="cancelDelete">
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer" class="dialog-footer">
                <el-button @click="cancelDelete">取 消</el-button>
                <el-button type="danger" @click="confirmDelete">确 定</el-button>
            </span>
		</el-dialog>
	</div>
</template>

<script>
	import treeDao from "@components/tree"
	import request from "@components/requests"

	export default {
		name: "note_content",
		data() {
			return {
				user: null,
				avatorBaseUrl: this.$httpUrl.rbac + "avators/",
				note: {
					author: null,
					title: null
				},
				users: {},
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
				data: [],
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
					floorControl: {
						floor_editable: false,
						temp: {
							contentText: null
						}
					},
					commentControl: {
						comment_editable: false,
						temp: {
							content: null,
							fid: null,
							pid: null
						}
					},
					isInsert: null
				},
				deleteControl: {
					deletable: false,
					type: null,
					data: {
						floor: null,
						comment: null,
					}
				}
			}
		},
		computed: {
			pageData() {
				return this.tableControl.tableData.slice((this.pageControl.currentPage - 1) *
					this.pageControl.pageSize, this.pageControl.currentPage * this.pageControl.pageSize);
			},
			editable() {
				return this.editControl.floorControl.floor_editable || this.editControl.commentControl.comment_editable;
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
		},
		beforeRouteEnter(to, from, next) {
			if (from.name === "note_manage" && to.params.note) {
				next(vm => vm.setData(to.params.note));
			} else {
				next("/note_manage");
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
			setData(note) {
				this.note = note;
				this.requireData();
			},
			goBack() {
				this.$router.go(-1);
			},
			handleChoiceChange() {
				this.searchControl.keyWord = null;
			},
			requireData() {
				this.$ajax.request({
					url: '/cms/floors',
					method: this.$ajax.method.GET,
					params: {
						model: {
							nid: this.note.nid
						}
					},
					success: res => {
						this.data = res.data;
						this.data.forEach((floor) => {
							if (!floor.comments) {
								this.$set(floor, "comments", []);
							}
							this.$set(this.users, floor.author, null);
						});

						this.$ajax.allrequest(this.data.map(floor => ({
							method: this.$ajax.method.GET,
							url: "/cms/comments",
							params: {
								model: {
									fid: floor.fid
								}
							},
							success: res => {
								let value = this.$lodash.find(this.data, value => value.fid === floor.fid);
								if (value) {
									this.$set(value, "comments", this.$lodash.sortBy(res.data, val => val.time));

									for (const comment of res.data) {
										this.$set(this.users, comment.author, null);
									}
								} else {
									console.error(new Error(`can't find floor which fid==${floor.fid}`));
								}
							}
						})), {
							success: () => {
								console.log("请求", this.users);
								this.$ajax.allrequest(Object.keys(this.users).map(username => ({
									method: this.$ajax.method.GET,
									url: "/rbac/user",
									params: {
										model: {
											username: username
										}
									},
									success: res => {
										this.$set(this.users, res.data.username, res.data);
									}
								})));
							}
						});
					},
					loadingOptions: {
						loading: true,
						text: "正在获取数据",
						time: 0.2
					}
				});
			},
			getAvator(author) {
				if (this.users[author]) {
					return this.users[author].avator || "1.png";
				} else if (this.user.username === author) {
					return this.user.avator;
				} else {
					return "1.png";
				}
			},
			getPrefix(comments, comment) {
				let prefix = comment.author;
				if (comment.pid) {
					prefix = `${prefix}  回复  ${this.$lodash.find(comments, val => val.cid === comment.pid).author}`;
				}
				return prefix + " ： ";
			},
			canDelete(author) {
				if (author === this.user.username) {
					return true;
				} else {
					return !this.operationControl.delete;
				}
			},

			setEditStatus(floorControl, commentControl, isInsert = null) {
				if (floorControl.temp) {
					this.editControl.floorControl = floorControl;
				} else {
					this.editControl.floorControl.floor_editable = floorControl.floor_editable;
				}

				if (commentControl.temp) {
					this.editControl.commentControl = commentControl;
				} else {
					this.editControl.commentControl.comment_editable = commentControl.comment_editable;
				}

				this.editControl.isInsert = isInsert;
			},
			handleSaveFloor() {
				if (this.editControl.isInsert) {
					this.$ajax.request({
						method: this.$ajax.method.POST,
						url: "/cms/floor",
						data: {
							contentText: this.editControl.floorControl.temp.contentText,
							author: this.user.username,
							nid: this.note.nid
						},
						success: () => {
							this.$message.success("回复成功");
							this.requireData();
							this.setEditStatus(false, false, null, null, null);
						},
						error: () => {
							this.$message.error("回复失败");
							this.handleClose();
						}
					});
				} else {
					this.$ajax.request({
						method: this.$ajax.method.PUT,
						url: "/cms/floor",
						data: this.editControl.floorControl.temp,
						success: () => {
							this.$message.success("修改成功");
							this.requireData();
							this.setEditStatus(false, false, null, null, null);
						},
						error: () => {
							this.$message.error("修改失败");
							this.handleClose();
						}
					});
				}
			},
			handleSaveComment() {
				if (this.editControl.isInsert) {
					this.$ajax.request({
						method: this.$ajax.method.POST,
						url: "/cms/comment",
						data: {
							content: this.editControl.commentControl.temp.content,
							author: this.user.username,
							fid: this.editControl.commentControl.temp.fid,
							pid: this.editControl.commentControl.temp.pid
						},
						success: () => {
							this.$message.success("回复成功");
							this.requireData();
							this.setEditStatus(false, false, null, null, null);
						},
						error: () => {
							this.$message.error("回复失败");
							this.handleClose();
						}
					});
				} else {
					this.$ajax.request({
						method: this.$ajax.method.PUT,
						url: "/cms/comment",
						data: this.editControl.commentControl.temp,
						success: () => {
							this.$message.success("修改成功");
							this.requireData();
							this.setEditStatus(false, false, null, null, null);
						},
						error: () => {
							this.$message.error("修改失败");
							this.handleClose();
						}
					});
				}
			},
			handleClose() {
				this.setEditStatus({floor_editable: false}, {comment_editable: false});
			},
			handleInsertFloor() {
				this.setEditStatus({floor_editable: true}, {comment_editable: false}, true);
			},
			handleInsertComment(floor_parent, comment_parent = null) {
				this.setEditStatus({floor_editable: false}, {
					comment_editable: true,
					temp: {
						content: null,
						fid: floor_parent,
						pid: comment_parent
					}
				}, true);
			},
			handleUpdateFloor(floor) {
				this.setEditStatus({
					floor_editable: true,
					temp: floor
				}, {comment_editable: false}, false);
			},
			handleUpdateComment(comment) {
				this.setEditStatus({floor_editable: false}, {
					comment_editable: true,
					temp: comment
				}, false);
			},

			setDeleteStatus(deletable, type = null, value = null) {
				this.deleteControl.deletable = deletable;
				if (type && value) {
					this.deleteControl.type = type;
					this.deleteControl.data[type] = value;
				} else {
					this.deleteControl.type = null;
					this.deleteControl.data.floor = null;
					this.deleteControl.data.comment = null;
				}
			},
			handleDeleteFloor(note, floor) {
				if (note.time === floor.time) {
					this.$message.warning(`一楼不可删除`);
					return;
				}
				if (this.user.username === note.author || this.user.username === floor.author) {
					this.setDeleteStatus(true, "floor", floor);
				} else {
					request.getRolesByUsername(floor.author, this.searchControl.roleTree, roles => {
						treeDao.can(this.searchControl.roleTree, this.user.roleTree, roles, () => {
							this.setDeleteStatus(true, "floor", floor);
						}, role => {
							this.$message.warning(`权限不足以删除${role.rolename}的楼层`);
						});
					});
				}
			},
			handleDeleteComment(note, comment) {
				if (this.user.username === note.author || this.user.username === comment.author) {
					this.setDeleteStatus(true, "comment", comment);
				} else {
					request.getRolesByUsername(comment.author, this.searchControl.roleTree, roles => {
						treeDao.can(this.searchControl.roleTree, this.user.roleTree, roles, () => {
							this.setDeleteStatus(true, "comment", comment);
						}, role => {
							this.$message.warning(`权限不足以删除${role.rolename}的评论`);
						});
					});
				}
			},
			cancelDelete() {
				this.setDeleteStatus(false);
			},
			confirmDelete() {
				if (this.deleteControl.type === "floor") {
					this.$ajax.request({
						method: this.$ajax.method.DELETE,
						url: `/cms/floor/fid/${this.deleteControl.data.floor.fid}`,
						success: () => {
							this.$message.success("删除成功");
							this.requireData();
							this.cancelDelete();
						},
						error: () => {
							this.$message.error("删除失败");
							this.cancelDelete();
						}
					});
				} else {
					this.$ajax.request({
						method: this.$ajax.method.DELETE,
						url: `/cms/comment/cid/${this.deleteControl.data.comment.cid}`,
						success: () => {
							this.$message.success("删除成功");
							this.requireData();
							this.cancelDelete();
						},
						error: () => {
							this.$message.error("删除失败");
							this.cancelDelete();
						}
					});
				}
			}
		}
	}
</script>

<style lang="less" scoped>

	.header {
		height: 40px;
		line-height: 40px;
		margin: 20px 20px 20px 20px;
		background-color: #FFFFFF;

		.title {
			float: left;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.insert {
			float: left;
			margin-left: 20px;
			height: 40px;
		}

	}

	.floors {
		height: auto;
		overflow: auto;

		.floor {
			height: auto;
			overflow: auto;

			.user-info {
				float: left;
				width: 15%;
				text-align: center;
				margin: 20px 0 0 0;
				padding-bottom: 20px;

				.user-avator {
					width: 100px;
					height: 100px;
					border-radius: 50%;
				}

				.user-username {
					font-size: 14px;
					color: #222;
				}
			}

			.content {
				float: right;
				width: 85%;
				padding: 0;

				.floor-content {
					height: auto;
					overflow: auto;
					min-height: 100px;
				}

				.collapse {
					height: auto;
					overflow: auto;
					padding: 20px;

					.info {
						width: 100%;

						.btn {
							float: right;
							margin-right: 20px;
						}

						.comments {
							float: right;
							margin-right: 20px;
							color: #409EFF;
						}

						.time {
							float: right;
							margin-right: 20px;
						}
					}

					.comment {

						.comment-body {
							height: auto;
							overflow: auto;

							.user-avator {
								float: left;
								width: 48px;
								height: 48px;
								border-radius: 50%;
							}

							.comment-content {
								float: left;
								line-height: 48px;
								margin-left: 20px;
							}

						}

						.btn {
							float: right;
							margin-right: 20px;
							line-height: 48px;
						}

						.time {
							float: right;
							text-align: center;
							margin-right: 20px;
							line-height: 48px;
						}

					}
				}
			}
		}
	}

	.edit-comment-dialog {
		.mgnB_20 {
			margin-bottom: 20px;
		}
	}
</style>