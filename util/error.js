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

	throw() {
		throw this;
	}
}

export class ChipbooruWarning extends ChipbooruError {
	constructor(code, value) {
		super(code, value);
		this.message = "Warning: " + this.message;
	}

	throw() {
		console.warn(this);
	}
}