export function recur(callback, ...params) {
	function iterate(...params) {
		return callback(iterate, ...params);
	}
	return iterate(...params);
}

export function objectAssignRecursive(obj, that, options) {
	recur((iterate, entries, that) => {
		for (const [key, value] of entries) {
			if (value.constructor.name === "Object") {
				that[key] ??= {};
				iterate(Object.entries(value), that[key]);
			} else
				if (options?.reassign ?? true) that[key] = value;
				else that[key] ??= value;
		}
	}, Object.entries(obj), that);
}