export class Enum {
	constructor(number, string = {}) {
		for (const [key, value] of Object.entries(number)) {
			this[key] = value;
			this[value] = key;
		};
		for (const [key, value] of Object.entries(string)) {
			this[key] = value;
		}
	}
}