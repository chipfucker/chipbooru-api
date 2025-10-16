export default {
	// apiKey
	NO_SETKEY_PARAM: () => ({
		message: "setKey() was called without a parameter.",
		hint: "An object must be specified when setting an API key."
	}),
	SETKEY_PARAM_NOT_OBJECT: () => ({
		message: "setKey() was called with a parameter that is not an object.",
		hint: "A valid key-value object must be specified when setting an API key."
	}),
	IMAGEBOARD_NOT_YET_SUPPORTED: (value) => ({
		message: `The imageboard '${value}' is currently planned but not supported.`,
		hint: null
	}),
	IMAGEBOARD_NOT_SUPPORTED: (value) => ({
		message: `The imageboard '${value}' is not supported.`,
		hint: null
	}),

	// rule34.fetch
	INVALID_ID_INPUT_TYPE: () => ({
		message: "Rule34.fetch() was called with an ID parameter that could not be coerced into a number.",
		hint: "The input must be an integer, an integer-coercible, or an integer-coercible string prefixed with 'id:' (i.e. 'id:123')."
	}),
	INVALID_ID_DIVISION: (value) => ({
		message: `Rule34.fetch() was called with an ID that is not an integer (${value}).`,
		hint: "The input must be a whole number \u2014 decimals are not allowed."
	}),
	INVALID_ID_INDEX: (value) => ({
		message: "Rule34.fetch() was called with an ID under 1.",
		hint: "The input must be greater or equal to 1."
	}),

	// rule34 getUrl
	RULE34_NO_API_KEY: () => ({
		message: "",
		hint: ""
	}),
	RULE34_NO_USER_ID: () => ({
		message: "",
		hint: ""
	})

	/* Template
	,
	ERROR_CODE: (value) => ({
		message: "",
		hint: ""
	}) */
};