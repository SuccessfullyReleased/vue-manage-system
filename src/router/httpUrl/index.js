module.exports = {

	install: function (Vue) {
		Vue.prototype.$httpUrl = this;
	},

	// address: '192.168.43.24',
	// port: 5001,
	// projectName: 'demo',
	// baseUrl: function () {
	// 	return `http://${this.address}:${this.port}/${this.projectName}/`;
	// },
	//
	// remoteAddress: "192.168.38.55",
	// remotePort: 5000,
	// remoteProjectName: "pbs",
	remoteBaseUrl: "https://localhost:5000/rbac/"
};