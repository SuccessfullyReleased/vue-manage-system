module.exports = {

	install: function (Vue) {
		Vue.prototype.$httpUrl = this;
	},

	rbac: "http://localhost:9500/rbac/",
	cms: "http://localhost:9501/cms/"
};