import Vue from "vue"
import _ from "lodash"

function createTree(_roles) {
	if (!_roles || _roles.length === 0) {
		return [];
	}
	let roles = _roles.concat();
	let tree = [];

	for (let i = roles.length - 1; i >= 0; i--) {
		let role = roles[i];
		Vue.set(role, "children", []);
		if (!role.parent) {
			tree = tree.concat(roles.splice(i, 1));
		}
	}

	let getChildren = function (node, roles) {
		for (let i = roles.length - 1; i >= 0; i--) {
			let role = roles[i];
			if (role.parent === node.rid) {
				node.children = node.children.concat(roles.splice(i, 1));
				getChildren(role, roles);
			}
		}
	};

	tree.forEach(root => {
		getChildren(root, roles);
	});
	return tree;
}

function get_roots(roleTree, _roles) {
	if (!roleTree || !_roles) {
		throw new Error("arguments have null");
	}
	if (!_roles || _roles.length === 0) {
		return [];
	}
	let roles = _roles.concat();
	let tree = [];

	for (let i = roles.length - 1; i >= 0; i--) {
		let role = roles[i];
		if (!role.parent) {
			tree = tree.concat(roles.splice(i, 1));
		}
	}

	if (tree.length === 0) {
		let rootRoles = function (node, roles) {
			let temp = _.find(roles, val => val.rid === node.rid);
			if (temp) {
				tree.push(temp);
			} else {
				if (node.children) {
					for (const child of node.children) {
						rootRoles(child, roles);
					}
				}
			}
		};

		rootRoles(roleTree[0], roles);
		return tree;
	} else {
		return tree;
	}
}


function can(roleTree, userRoots, roles, resolve, reject) {
	let isInTree = function (rid) {
		let path = findNodePath(roleTree, "rid", rid);
		for (const rootNode of userRoots) {
			let index = _.findIndex(path, role => role.rid === rootNode.rid);
			if (index !== -1 && index !== path.length - 1) {
				return true;
			}
		}
		return false;
	};

	let roots = get_roots(roleTree, roles);
	console.log(roots);
	if (roots.length > 0) {
		for (const role of roots) {
			if (!isInTree(role.rid)) {
				reject(role);
				return;
			}
		}
	}
	resolve();
}

function createRoleTree(roles) {
	return createTree(roles);
	// if (!roles || roles.length === 0) {
	// 	return [];
	// }
	// roles.sort((a, b) => a.rid - b.rid);
	// let tree = [];
	// roles.forEach((role) => {
	// 	Vue.set(role, "children", []);
	// 	if (role.parent) {
	// 		let node = findInTree(tree, "rid", role.parent);
	// 		if (node) {
	// 			node.children.push(role);
	// 		} else {
	// 			if (role.parent === 1) {
	// 				tree.push(role);
	// 			} else {
	// 				throw new Error(`can't find rid ${role.parent}`)
	// 			}
	// 		}
	// 	} else {
	// 		tree.push(role);
	// 	}
	// });
	// return tree;
}

function createAccessTree(accesses) {
	if (!accesses || accesses.length === 0) {
		return [];
	}
	accesses.sort((a, b) => a.aid - b.aid);

	let _accesses = accesses.map(access => {
		if (access.type === "menu") {
			access.nodename = access.menu.name;
		} else {
			access.nodename = access.operation.name;
		}
		return access;
	});
	let menus = _accesses.filter(access => access.type === "menu");
	let tree = [];
	menus.forEach(menu => {
		Vue.set(menu, "disabled", true);
		Vue.set(menu, "children", []);
		if (menu.menu.parent) {
			let node = findInTree(tree, "menu.mid", menu.menu.parent);
			if (node) {
				node.children.push(menu);
			} else {
				throw new Error(`can't find mid ${menu.menu.parent}`)
			}
		} else {
			tree.push(menu);
		}
	});
	let operations = _accesses.filter(access => access.type === "operation");
	traverseTree(tree, node => {
		if (node.menu && node.menu.key && node.menu.key.length > 0) {
			for (const operation of operations) {
				if (operation.operation.key.indexOf(node.menu.key) !== -1) {
					Vue.set(operation, "disabled", true);
					node.children.push(operation);
				}
			}
		}
	});
	return tree;
}

function findInTree(tree, key, value) {
	let stack = tree.concat();
	let node;
	while (stack.length > 0) {
		node = stack.pop();
		if (_.get(node, key) === value) {
			return node;
		} else {
			if (node.children && node.children.length > 0) {
				stack = stack.concat(node.children);
			}
		}
	}
}

function findNodePath(tree, key, value) {
	let path = [];
	let fun = (node) => {
		path.push(node);
		if (_.get(node, key) === value) {
			return true;
		} else {
			if (node.children && node.children.length > 0) {
				for (const child of node.children) {
					if (fun(child)) {
						return true;
					}
				}
				//当前节点的子节点遍历完依旧没找到，则删除路径中的该节点
				path.pop();
			} else {
				//找到叶子节点时，删除路径当中的该叶子节点
				path.pop();
			}
		}
	};
	for (const node of tree) {
		if (fun(node)) {
			break;
		}
	}
	return path;
}

function traverseTree(tree, callback) {
	if (tree) {
		let stack = tree.concat();
		let node;
		while (stack.length > 0) {
			node = stack.pop();
			callback(node);
			if (node.children && node.children.length > 0) {
				stack = stack.concat(node.children);
			}
		}
	}
}

export default {
	createRoleTree, createAccessTree, findInTree, findNodePath, traverseTree, get_roots, can
}