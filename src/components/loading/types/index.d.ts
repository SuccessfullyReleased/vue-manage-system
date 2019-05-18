export declare interface loadingOptions {

	loading: boolean,
	lock?: boolean,
	time?: number,
	text?: string,
	spinner?: string,
	background?: string,
	target?: object

}

export declare interface loading {

	loadStart(loadingOptions: loadingOptions): void,

	loadFinish(time: number): void

}