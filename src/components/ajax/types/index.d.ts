import Vue from 'vue';
import './vue';
import {loadingOptions} from "../../loading/types";
import {AxiosStatic} from "axios";


export function install(vue: typeof Vue): void;

export declare interface Method {
	GET: string,
	POST: string,
	PUT: string,
	DELETE: string
}

export declare interface Option {

	method?: string,
	url?: string,
	root?: string,
	path?: string,
	params?: object,
	data?: object,
	async?: boolean,
	auth?: boolean,
	success?: Function,
	error?: Function,
	loadingOptions?: loadingOptions,
	dev?: boolean,

}

export declare interface ajax {

	method: Method

	setVueInstance(VueInstance: object): void

	getVueInstance(): object

	getAxios(): AxiosStatic

	setCookiesInstance(Cookies: object): void

	request(options: Option): void;

	allrequest(options: Array<Option>, total_options?: Option): void;

}
