import Vue from 'vue';
import './vue';

export function install(vue: typeof Vue): void;

export declare interface httpUrl {

	// address: string,
	// port: number,
	// projectName: string,
	// baseUrl: Function,

	// remoteAddress: string,
	// remotePort: number,
	// remoteProjectName: string,
	remoteBaseUrl: string

}
