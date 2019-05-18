import Vue from 'vue';
import './vue';
import {loadingOptions} from "../../loading/types";


export function install(vue: typeof Vue): void;

export declare interface Method {
	GET: string,
	POST: string,
	PUT: string,
	DELETE: string
}

export declare interface Option {

	dev?: boolean,
	loadingOptions?: loadingOptions,
	success?: Function,
	error?: Function,
	method?: string,
	dataType?: string,
	params?: object,
	data?: object,
	url?: string,
	root?: string,
	path?: string,

}

export declare interface ajax {

	method: Method

	setVueInstance(VueInstance: object): void

	setCookiesInstance(Cookies: object): void

	request(options: Option): void;

	allrequest(options: Array<Option>, total_options?: Option): void;

}
