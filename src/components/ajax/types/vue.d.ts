import {ajax} from "./index";

declare module "vue/types/vue" {
	interface Vue {
		$ajax: ajax;
	}

	interface VueConstructor {
		ajax: ajax;
	}
}
