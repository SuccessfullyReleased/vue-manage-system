<template>
	<div id="app">
		<router-view/>
	</div>
</template>
<script>
	export default {
		name: 'App',
		created() {
			//在页面加载时读取sessionStorage里的状态信息
			if (sessionStorage.getItem("store.js.js")) {
				console.log('页面加载时读取sessionStorage');
				let store = JSON.parse(sessionStorage.getItem("store.js.js"));
				if (store)
					this.$store.replaceState(Object.assign({}, this.$store.state, store));
			}

			//在页面刷新时将vuex里的信息保存到sessionStorage里
			window.addEventListener("beforeunload", () => {
				console.log('页面刷新时将vuex里的信息保存到sessionStorage');
				sessionStorage.setItem("store.js.js", JSON.stringify(this.$store.state))
			})
		}
	}
</script>
<style lang="less">
	@import "~@public/css/main.css";
	@import "~@public/css/color-dark.css";
</style>
