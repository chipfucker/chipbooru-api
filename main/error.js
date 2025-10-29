import errorCode from "./errorCode.js";

export class ChipbooruError extends Error {
	constructor(code, value) {
		super();
		this.name = `Chipbooru [${code}]`;
		this.message = (
			errorCode[code](value).message
			+ `\n${errorCode[code](value)?.hint || ""}`
		).trim();
	}

	static throw(code, value) {
		throw new this(code, value);
	}

	static warn(code, value) {
		console.warn(new this(code, value));
	}
}