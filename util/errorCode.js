export default {
	// apiKey
	SETKEY_NO_PARAM: () => ({
		message: "setKey() was called without a parameter.",
		hint: "An object must be specified when setting an API key."
	}),
	SETKEY_NOT_OBJECT: () => ({
		message: "setKey() was called with a parameter that is not an object.",
		hint: "A valid key-value object must be specified when setting an API key."
	}),

	IMAGEBOARD_NOT_SUPPORTED_YET: (booru) => ({
		message: `The imageboard '${booru}' is currently planned but not supported.`,
		hint: null
	}),
	IMAGEBOARD_NOT_SUPPORTED: (booru) => ({
		message: `The imageboard '${booru}' is not supported.`,
		hint: null
	}),

	NO_APIKEY: ([booru, key]) => ({
		message: `A ${booru} function was called without the necessary API key set (${value})`,
		hint: ""
	}),

	// fetch
	GET_INVALID_TYPE: () => ({
		message: "#get() was called with an ID parameter that could not be coerced into a number.",
		hint: "The input must be an integer, an integer-coercible, or an integer-coercible string prefixed with 'id:' (i.e. 'id:123')."
	}),
	GET_INVALID_DIVISION: (num) => ({
		message: `#get() was called with an ID that is not an integer (${num}).`,
		hint: "The input must be a whole number \u2014 decimals are not allowed."
	}),
	GET_INVALID_INT: (int) => ({
		message: `#get() was called with an invalid number (${int}).`,
		hint: "The input must be greater or equal to 1."
	})
};