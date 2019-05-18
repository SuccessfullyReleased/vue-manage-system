import {httpUrl} from "./index"

declare module "vue/types/vue" {
	interface Vue {
		$httpUrl: httpUrl;
	}
}
