import { ChipbooruError, ChipbooruWarning } from "../util/error.js";
import { getApiKey } from "../util/apiKey.js";
import { DOMParser } from "xmldom";

async function get(input, options) {
	var id;
	if (typeof input === "string") id = input.match(/^(?:id:)?(\d+)$/)?.at(1);
	id = Number(id ?? input);

	if (Number.isNaN(id))
		new ChipbooruError("GET_INVALID_TYPE").throw();
	if (!Number.isInteger(id))
		new ChipbooruError("GET_INVALID_DIVISION", id).throw();
	if (id < 1)
		new ChipbooruError("GET_INVALID_INT", id).throw();

	const response = await draw.post({
		limit: 1,
		json: true,
		tags: `id:${id}`
	});

	if (options.vanilla)
		return new rule34Vanilla(response);

	const [json] = response;

	if (json === undefined)
		return null;
	else
		return new rule34Post(format.initial(json[0]));
}

export async function search(input, options) {

}

class rule34Post {
	constructor(obj) {
		Object.assign(this, obj);
	}

	revertFormat() {

	}
}

class rule34Vanilla {
	constructor(array) {
		Object.assign(this, array);
	}

	format() {

	}
}

const secret = getApiKey("rule34");

const getUrl  = {
	post: (params) => {
		const baseUrl = "https://api.rule34.xxx";
		const search = new URLSearchParams(params).toString();
		return `${baseUrl}?${search}`;
	},
	autocomplete: (params) => {

	}
};

const draw = {
	async post(options) {
		if (!secret.api_key)
			new ChipbooruError("NO_APIKEY", ["Rule34", "api_key"]).throw();
		if (!secret.user_id)
			new ChipbooruError("NO_APIKEY", ["Rule34", "user_id"]).throw();

		const response = await fetch(getUrl.post({
			page: "dapi",
			s: "post",
			q: "index",
			limit: options?.limit ?? 1,
			json: Number(options.json),
			fields: options?.json ? "tag_info" : null,
			tags: options?.tags ?? null,
			api_key: secret.api_key,
			user_id: secret.user_id
		}));

		console.debug("PLZ CHECK CONTENT-TYPE:", response.headers);

		if (response.headers["Content-Type"].match(/application\/json/)) {
			return await response.json();
		} else if (response.headers["Content-Type"].match(/text\/xml/))
			// may also be "application/xml"
			return await response.text()
				.then(text => new DOMParser().parseFromString(text, "text/xml"));
	}
}

const format = {
	initial: (obj) => {
		if (obj.constructor.name !== "Object")
			throw new Error("Attempted to format an invalid object as initial object.");
		return {
			image: {
				main: {
					url: obj.file_url,
					width: obj.width,
					height: obj.height
				},
				sample: {
					url: obj.sample_url,
					width: obj.sample_width,
					height: obj.sample_height,
					necessary: obj.sample
				},
				thumbnail: {
					url: obj.preview_url,
					width: undefined,
					height: undefined
				},
				directory: obj.directory,
				name: obj.image,
				hash: obj.hash,
				extension: obj.image.split(".").pop()
			},
			id: obj.id,
			created: undefined,
			updated: dateObject(obj.change * 1000),
			creator: {
				name: obj.owner,
				id: undefined
			},
			rating: obj.rating,
			score: obj.score,
			status: obj.status,
			notes: obj.has_notes, // TODO: find out how to fetch note info
			parent: obj.parent_id,
			source: obj.source
		};
	},
	xml: (obj) => {
		if (obj.constructor.name !== "Document")
			// "Document" may be something else
			throw new Error();
		return {
			image: {
				thumbnail: {
					width: Number(obj.getAttribute("preview_width")),
					height: Number(obj.getAttribute("preview_height"))
				}
			}
		};
	},
	date: (date) => {

	}
}