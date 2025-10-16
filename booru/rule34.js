import { ChipbooruError, ChipbooruWarning } from "../util/error.js";
import { getApiKey } from "../util/apiKey.js";
import { DOMParser } from "xmldom";

async function get(input, options) {
	var id;
	if (typeof input === "string") id = input.match(/^(?:id:)?(\d+)$/)?.at(1);
	id = Number(id ?? input);

	if (Number.isNaN(id))
		new ChipbooruError("INVALID_ID_INPUT_TYPE").throw();
	if (!Number.isInteger(id))
		new ChipbooruError("INVALID_ID_DIVISION", id).throw();
	if (id < 1)
		new ChipbooruError("INVALID_ID_INDEX", id).throw();

	const json = await fetch(getUrl.post({
		limit: 1,
		json: true,
		tags: `id:${id}`
	}))
	if (options.vanilla) {
		return new rule34Vanilla(json);
	}
}

export async function search(input, options) {

}

class rule34Post {
	constructor(json) {
		
	}

	get revertFormat() {

	}
}

class rule34Vanilla {
	constructor(json) {

	}

	get reformat() {

	}
}

const secret = getApiKey("rule34");

const getUrl = {
	post(options) {
		if (!secret.api_key)
			new ChipbooruError("RULE34_NO_API_KEY").throw();
		if (!secret.user_id)
			new ChipbooruError("RULE34_NO_USER_ID").throw();

		const url = new URL("https://api.rule34.xxx/");

		const parameters = {
			page: "dapi",
			s: "post",
			q: "index",
			limit: options?.limit ?? 1,
			json: Number(options.json),
			fields: options?.json ? "tag_info" : null,
			tags: options?.tags ?? null,
			api_key: secret.api_key,
			user_id: secret.user_id
		}
		url.searchParams.set("page", "dapi");
		url.searchParams.set("s", "post");
		url.searchParams.set("q", "index");
	}
}