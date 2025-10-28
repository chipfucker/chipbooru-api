export class Enum {
	constructor(input) {
		for (const [key, value] of Object.entries(input)) {
			this[key] = value;
			this[value] = key;
		}
	}
}