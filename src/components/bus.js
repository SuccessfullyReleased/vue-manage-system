
// 使用 Event Bus
const bus = {
	install(Vue) {
		const EventBus = new Vue({});
		Vue.prototype.$bus = EventBus;
		Vue.EventBus = EventBus;
		window.EventBus = EventBus;
	}
};

export default bus;

