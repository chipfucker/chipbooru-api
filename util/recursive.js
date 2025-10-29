export function recur(callback, ...params) {
	function iterate(...params) {
		return callback(iterate, ...params);
	}
	return iterate(...params);
}

export function assignRecursive(that, obj, options) {
	if (options?.reassign ?? true)
		recur((iterate, that, entries) => {
			for (const [key, value] of entries) {
				if (value.constructor.name === "Object") {
					that[key] ??= {};
					iterate(that[key], Object.entries(value));
				} else that[key] = value;
			}
		}, that, Object.entries(obj));
	else
		recur((iterate, that, entries) => {
			for (const [key, value] of entries) {
				if (value.constructor.name === "Object") {
					that[key] ??= {};
					iterate(that[key], Object.entries(value));
				} else that[key] ??= value;
			}
		}, that, Object.entries(obj));
}