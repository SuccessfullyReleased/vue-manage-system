import Vue from 'vue';
import './vue';

export function install(vue: typeof Vue): void;

export declare interface httpUrl {
	rbac: string,
	cms: string
}
