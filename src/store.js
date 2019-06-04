import Vue from 'vue'
import Vuex from 'vuex'
import requests from "@components/requests"
import ajax from "@components/ajax"

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		user: null,
		userGroupOptions: null,
		roleOptions: null,
		roleTree: null,
		accessOptions: null,
		accessTree: null,
	},
	getters: {
		getUser: state => {
			return state.user;
		},
		getUserGroupOptions: state => {
			return state.userGroupOptions;
		},
		getRoleOptions: state => {
			return state.roleOptions;
		},
		getRoleTree: state => {
			return state.roleTree;
		},
		getAccessOptions: state => {
			return state.accessOptions;
		},
		getAccessTree: state => {
			return state.accessTree;
		},
	},
	mutations: {
		setUser(state, user) {
			if (user) {
				state.user = user;
			} else {
				state.user = null;
			}
		},
		setUserGroupOptions(state, userGroupOptions) {
			if (userGroupOptions) {
				state.userGroupOptions = userGroupOptions;
			} else {
				state.userGroupOptions = null;
			}
		},
		setRoleOptions(state, roleOptions) {
			if (roleOptions) {
				state.roleOptions = roleOptions;
			} else {
				state.roleOptions = null;
			}
		},
		setRoleTree(state, roleTree) {
			if (roleTree) {
				state.roleTree = roleTree;
			} else {
				state.roleTree = null;
			}
		},
		setAccessOptions(state, accessOptions) {
			if (accessOptions) {
				state.accessOptions = accessOptions;
			} else {
				state.accessOptions = null;
			}
		},
		setAccessTree(state, accessTree) {
			if (accessTree) {
				state.accessTree = accessTree;
			} else {
				state.accessTree = null;
			}
		}
	},
	actions: {
		init(context, username) {
			return new Promise((resolve, reject) => {
				ajax.request(requests.getUserGroupOptions(userGroupOptions => {
					context.commit("setUserGroupOptions", userGroupOptions);
				}));
				ajax.request(requests.getRoleOptions(roleOptions => {
					context.commit("setRoleOptions", roleOptions);
					let roleTree = requests.getRoleTree(roleOptions);
					context.commit("setRoleTree", roleTree);
					ajax.request(requests.init(username, roleTree, user => {
						context.commit("setUser", user);
						resolve();
					}, err => {
						reject(err);
					}));
				}));
				ajax.request(requests.getAccessOptions(accessOptions => {
					context.commit("setAccessOptions", accessOptions);
					context.commit("setAccessTree", requests.getAccessTree(accessOptions));
				}));
			})
		},
		resetUser(context, uid) {
			return new Promise((resolve, reject) => {
				ajax.request(requests.getUserById(uid, user => {
					context.commit("setUser", user);
					resolve();
				}, err => {
					reject(err);
				}));
			})
		},
		resetUserGroupOptions(context) {
			return new Promise((resolve, reject) => {
				ajax.request(requests.getUserGroupOptions(userGroupOptions => {
					context.commit("setUserGroupOptions", userGroupOptions);
					resolve(userGroupOptions)
				}, err => {
					reject(err)
				}));
			});
		},
		resetRoles(context) {
			return new Promise((resolve, reject) => {
				ajax.request(requests.getRoleOptions(roleOptions => {
					context.commit("setRoleOptions", roleOptions);
					let roleTree = requests.getRoleTree(roleOptions);
					context.commit("setRoleTree", roleTree);
					resolve(roleOptions, roleTree);
				}, err => {
					reject(err)
				}));
			});
		},
		resetAccesses(context) {
			return new Promise((resolve, reject) => {
				ajax.request(requests.getAccessOptions(accessOptions => {
					context.commit("setAccessOptions", accessOptions);
					let accessTree = requests.getAccessTree(accessOptions);
					context.commit("setAccessTree", accessTree);
					resolve(accessOptions, accessTree);
				}, err => {
					reject(err)
				}));
			});
		}
	}
})
