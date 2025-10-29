export default {
	_TEST_ERROR: (param) => ({
		message: "This is a test error.",
		hint: "You should not be seeing this. If you are, it's probably on my dumbass self. Please contact me about it."
	}),
	_TEMP: (param) => ({
		message: "Generic error without proper label thrown.",
		hint: "You shouldn't be seeing this\u2014contact me if you are\u2014but this usually indicates an error occured, for which I haven't written a proper ID for. Check the stack and see if it's anything on your part."
	}),

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
		message: `A ${booru} function was called without the necessary API key set (${key})`,
		hint: ""
	}),
	INVALID_APIKEY: (booru) => ({
		message: `A ${booru} function was called with an invalid API key.`,
		hint: ""
	}),

	GET_INVALID_TYPE: () => ({
		message: "#get() was called with an ID that could not be coerced into a number.",
		hint: "The ID must be an integer, an integer-coercible, or an integer-coercible string prefixed with 'id:' (i.e. 'id:123')."
	}),
	GET_INVALID_DIVISION: (num) => ({
		message: `#get() was called with an ID that is not an integer (${num}).`,
		hint: "The ID must be a whole number \u2014 decimals are not allowed."
	}),
	GET_INVALID_INT: (int) => ({
		message: `#get() was called with an invalid ID number (${int}).`,
		hint: "The ID must be greater or equal to 1."
	}),
	GET_INVALID_OPTION: (option) => ({
		message: `#get() was called with an invalid option (${option}).`,
		hint: "The list of possible values for this option is available in the documentation. https://chipfucker.github.io/chipbooru/api"
	})
};