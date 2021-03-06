import ajax from "@components/ajax"
import _ from "lodash";
import cookies from "vue-cookies"
import treeDao from "./tree"

// function getUserById(uid, resolve, reject) {
// 	return {
// 		name: "checkToken",
// 		method: ajax.method.GET,
// 		url: "/rbac/user/token",
// 		success: () => {
// 			ajax.request({
// 				name: "resetUser",
// 				url: `/rbac/user/uid/${uid}`,
// 				method: ajax.method.GET,
// 				success: (res) => {
// 					if (res.status) {
// 						let user = res.data;
// 						if (user.userGroups && user.userGroups.length > 0) {
// 							ajax.request({
// 								url: "/rbac/userGroups/roles",
// 								method: ajax.method.POST,
// 								data: user.userGroups,
// 								success: res => {
// 									user.const_roles = res.data;
// 									user.total_roles = _.uniqBy(user.roles.concat(user.const_roles), 'rid');
// 									user.roleTree = treeDao.createRoleTree(user.total_roles);
// 									if (user.roles.length > 0 || user.const_roles.length > 0) {
// 										ajax.request({
// 											url: "/rbac/roles/accesses",
// 											method: ajax.method.POST,
// 											data: user.total_roles,
// 											success: res => {
// 												user.accesses = _.uniqBy(res.data, "aid");
// 												resolve(user)
// 											},
// 											error: err => {
// 												throw new Error("获取权限失败");
// 											}
// 										})
// 									}
// 								},
// 								error: err => {
// 									throw new Error("获取用户组角色失败");
// 								}
// 							});
// 						} else {
// 							user.const_roles = [];
// 							user.total_roles = _.uniqBy(user.roles.concat(user.const_roles), 'rid');
// 							user.roleTree = treeDao.createRoleTree(user.total_roles);
// 							if (user.roles.length > 0 || user.const_roles.length > 0) {
// 								ajax.request({
// 									url: "/rbac/roles/accesses",
// 									method: ajax.method.POST,
// 									data: user.total_roles,
// 									success: res => {
// 										user.accesses = res.data;
// 										resolve(user)
// 									},
// 									error: err => {
// 										throw new Error("获取权限失败");
// 									}
// 								})
// 							} else {
// 								user.accesses = [];
// 								resolve(user)
// 							}
// 						}
// 					}
// 				},
// 				error: () => {
// 					throw new Error("初始化用户失败")
// 				}
// 			})
// 		},
// 		error: err => {
// 			cookies.remove("token");
// 			console.log("校验token失败");
// 			reject(err);
// 		}
// 	}
// }

function init(username, roleTree, resolve, reject) {
	return {
		name: "createToken",
		method: ajax.method.POST,
		url: "/rbac/user/token",
		params: {
			username: username
		},
		success: res => {
			if (res.data) {
				cookies.set("token", res.data);
			}
			ajax.request({
				name: "getUser",
				url: "/rbac/user",
				method: ajax.method.GET,
				params: {
					model: {
						username: username
					}
				},
				success: (res) => {
					if (res.status) {
						let user = res.data;
						if (user.userGroups && user.userGroups.length > 0) {
							ajax.request({
								url: "/rbac/userGroups/roles",
								method: ajax.method.POST,
								data: user.userGroups,
								success: res => {
									user.const_roles = res.data;
									user.total_roles = _.uniqBy(user.roles.concat(user.const_roles), 'rid');
									user.roleTree = treeDao.get_roots(roleTree, user.total_roles);
									if (user.roles.length > 0 || user.const_roles.length > 0) {
										ajax.request({
											url: "/rbac/roles/accesses",
											method: ajax.method.POST,
											data: user.total_roles,
											success: res => {
												user.accesses = _.uniqBy(res.data, 'aid');
												resolve(user)
											},
											error: err => {
												throw new Error("获取权限失败");
											}
										})
									}
								},
								error: err => {
									throw new Error("获取用户组角色失败");
								}
							});
						} else {
							user.const_roles = [];
							user.total_roles = _.uniqBy(user.roles.concat(user.const_roles), 'rid');
							user.roleTree = treeDao.get_roots(roleTree, user.total_roles);
							if (user.roles.length > 0 || user.const_roles.length > 0) {
								ajax.request({
									url: "/rbac/roles/accesses",
									method: ajax.method.POST,
									data: user.total_roles,
									success: res => {
										user.accesses = res.data;
										resolve(user)
									},
									error: err => {
										throw new Error("获取权限失败");
									}
								})
							} else {
								user.accesses = [];
								resolve(user)
							}
						}
					}
				},
				error: () => {
					throw new Error("初始化用户失败")
				}
			})
		},
		error: err => {
			cookies.remove("token");
			console.log("创建token失败");
			reject(err);
		}
	}
}

function getRolesByUsername(username, roleTree, resolve, reject) {
	ajax.request({
		url: "/rbac/user",
		method: ajax.method.GET,
		params: {
			model: {
				username: username
			}
		},
		success: (res) => {
			if (res.status) {
				let user = res.data;
				if (user.userGroups && user.userGroups.length > 0) {
					ajax.request({
						url: "/rbac/userGroups/roles",
						method: ajax.method.POST,
						data: user.userGroups,
						success: res => {
							user.const_roles = res.data;
							user.total_roles = _.uniqBy(user.roles.concat(user.const_roles), 'rid');
							resolve(user.total_roles);
						},
						error: err => {
							throw new Error("获取用户组角色失败");
						}
					});
				} else {
					user.total_roles = _.uniqBy(user.roles, 'rid');
					resolve(user.total_roles);
				}
			}
		},
		error: () => {
			reject();
		}
	})
}

function getUserGroupOptions(resolve, reject) {
	return {
		url: "/rbac/userGroups",
		method: ajax.method.GET,
		success: res => {
			resolve(res.data);
		},
		error: () => {
			reject();
		}
	}
}

function getRoleOptions(resolve, reject) {
	return {
		url: "/rbac/roles",
		method: ajax.method.GET,
		success: res => {
			resolve(res.data);
		},
		error: () => {
			reject();
		}
	}
}

function getRoleTree(roleOptions) {
	return treeDao.createRoleTree(roleOptions);
}

function getAccessOptions(resolve, reject) {
	return {
		url: `/rbac/accesses`,
		method: ajax.method.GET,
		success: res => {
			resolve(res.data);
		},
		error: () => {
			reject();
		}
	};
}

function getAccessTree(accessOptions) {
	return treeDao.createAccessTree(accessOptions);
}

export default {
	init, getRolesByUsername, getUserGroupOptions, getRoleOptions, getRoleTree, getAccessOptions, getAccessTree
}