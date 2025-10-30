export function recur(callback, ...params) {
	function iterate(...params) {
		return callback(iterate, ...params);
	}
	return iterate(...params);
}

export function assignRecursive(obj, that, options) {
	if (options?.reassign ?? true)
		recur((iterate, entries, that) => {
			for (const [key, value] of entries) {
				if (value.constructor.name === "Object") {
					that[key] ??= {};
					iterate(Object.entries(value), that[key]);
				} else that[key] = value;
			}
		}, Object.entries(obj), that);
	else
		recur((iterate, entries, that) => {
			for (const [key, value] of entries) {
				if (value.constructor.name === "Object") {
					that[key] ??= {};
					iterate(Object.entries(value), that[key]);
				} else that[key] ??= value;
			}
		}, Object.entries(obj), that);
}