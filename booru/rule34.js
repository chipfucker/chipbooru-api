import { ChipbooruError } from "../util/error.js";
import { getApiKey } from "../util/apiKey.js";
import { DOMParser } from "xmldom";

export async function get(input, options) {
	var id;
	if (typeof input === "string") id = input.match(/^(?:id:)?(\d+)$/)?.at(1);
	id = Number(id ?? input);

	if (Number.isNaN(id))
		ChipbooruError.throw("GET_INVALID_TYPE");
	if (!Number.isInteger(id))
		ChipbooruError.throw("GET_INVALID_DIVISION", id);
	if (id < 1)
		ChipbooruError.throw("GET_INVALID_INT", id);		
	
	if (options?.jsonOnly) {
		const response = await draw.post({
			limit: 1,
			json: true,
			tags: `id:${id}`
		});

		const [json] = response;
		
		if (json === undefined)
			return null;
		else
			return new Rule34Post(format.initial(json));
	}
	
	const response = await Promise.all([
		draw.post({
			limit: 1,
			json: true,
			tags: `id:${id}`
		}),
		draw.post({
			limit: 1,
			json: false,
			tags: `id:${id}`
		}),
		draw.comments({
			post_id: id
		}),
		draw.post({
			limit: 1000,
			json: true,
			tags: `parent:${id}`
		})
	]).then(async promise => ({
		json: await promise[0].json(),
		xml: parse.xml(await promise[1].text()),
		comments: parse.xml(await promise[2].text()),
		children: await promise[3].json()
	}));

	const obj = {};

	assign.initial(obj, response.json[0]);
	assign.xml(obj, response.xml.children[0]);
	assign.comments(obj, response.comments);
	assign.children(obj, response.children);

	return Rule34Post(obj);
}

export async function search(input, options) {

}

export const vanilla = {
	get: async (input, options) => {
		var id;
		if (typeof input === "string") id = input.match(/^(?:id:)?(\d+)$/)?.at(1);
		id = Number(id ?? input);
	
		if (Number.isNaN(id))
			ChipbooruError.throw("GET_INVALID_TYPE");
		if (!Number.isInteger(id))
			ChipbooruError.throw("GET_INVALID_DIVISION", id);
		if (id < 1)
			ChipbooruError.throw("GET_INVALID_INT", id);

		if (!options?.method || (!options.method.json && !options.method.xml && !options.method.comment))
			options.method.json = true;
		
		const promises = [
			options?.method?.json && draw.post({
				limit: options?.limit ?? 50,
				json: true,
				tags: `id:${id}`
			}),
			options?.method?.xml && draw.post({
				limit: options?.limit ?? 50,
				json: false,
				tags: `id:${id}`
			}),
			options?.method?.comment && draw.post({
				limit: options?.limit ?? 50,
				json: false,
				tags: `id:${id}`
			})
		];

		return await Promise.all(promises).then(async (array) => {
			const response = {};
			if (array[0]) response.json = await array[0].json();
			if (array[1]) response.xml = parse.xml(await array[1].text());
			if (array[2]) response.comment = parse.xml(await array[2].text());

			return response;
		});
	}
}

class Rule34Post {
	constructor(obj) {
		Object.assign(this, obj);
	}

	async getXML() {
		const obj = await draw.post({
			limit: 1,
			json: false,
			tags: `id:${this.id}`
		}).then(doc => doc.children[0]);

		assign.xml(this, obj);
		return this;
	}

	async getComments() {
		const obj = await draw.comments({
			post_id: this.id
		});

		assign.comments(this, obj);
		return this;
	}

	async getChildren() {
		const obj = await draw.post({
			limit: 1000,
			json: true,
			tags: `parent:${this.id}`
		});

		assign.children(this, obj);
		return this;
	}

	toString() {
		return `[object Rule34Post(${this.id})]`;
		/* Could be:
		 * [object Rule34Post]
		 * [5823623 Rule34Post]
		 * https://rule34.xxx?... (url to post)
		 */
	}
}

class Rule34Results {
	constructor(obj) {
		Object.assign(this, obj);
	}

	*[Symbol.iterator]() {
		for (const item of this) yield item;
	}
}

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
		const secret = getApiKey("rule34");

		if (!secret.api_key)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "api_key"]);
		if (!secret.user_id)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "user_id"]);

		const response = await fetch(getUrl.post({
			page: "dapi",
			s: "post",
			q: "index",
			limit: options?.limit ?? 1,
			json: Number(options.json),
			fields: options.json ? "tag_info" : "",
			tags: options?.tags ?? "",
			api_key: secret.api_key,
			user_id: secret.user_id
		}));

		if (response.headers.get("content-type").match(/application\/json/))
			return await response.json();
		else if (response.headers.get("content-type").match(/text\/xml/))
			return await response.text()
				.then(text => new DOMParser().parseFromString(text, "text/xml"));
	},
	async comments(options) {
		const secret = getApiKey("rule34");

		if (!secret.api_key)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "api_key"]);
		if (!secret.user_id)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "user_id"]);

		const response = await fetch(getUrl.post({
			page: "dapi",
			s: "comment",
			q: "index",
			post_id: options?.post_id
		}));

		return await response.text()
			.then(text => new DOMParser().parseFromString(text, "text/xml"));
	}
}

const assign = {
	initial: (that, obj) => {
		const json = format.initial(obj);

		Object.assign(that, json);

		that.applied = {
			xml: false,
			comments: false,
			children: false
		};
	},
	xml: (that, obj) => {
		const json = format.xml(obj);

		that.image.thumbnail.width = json.image.thumbnail.width;
		that.image.thumbnail.height = json.image.thumbnail.height;
		that.created = json.created;
		that.creator.id = json.creator.id;
		that.children = json.children;

		that.applied.xml = true;
	},
	comments: (that, obj) => {
		const json = Array.from(obj).map(child => format.comment(child));

		that.comments = json;

		that.applied.comments = true;
	},
	children: (that, obj) => {
		const json = obj.map(post => post.id);

		that.children = json;

		that.applied.children = true;
	}
};

const format = {
	json: (obj) => ({
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
				url: obj.preview_url
				// width: undefined
				// height: undefined
			},
			directory: obj.directory,
			name: obj.image,
			hash: obj.hash,
			extension: obj.image.match(/.*\.(.*)$/)[1]
		},
		id: obj.id,
		// created: undefined
		updated: format.date(obj.change * 1000),
		creator: {
			name: obj.owner
			// id: undefined
		},
		rating: obj.rating,
		score: obj.score,
		status: obj.status,
		notes: obj.has_notes, // TODO: find out how to fetch note info
		parent: obj.parent_id,
		source: obj.source,
		comments: Array(obj.comment_count)
	}),
	xml: (obj) => ({
		image: { thumbnail: {
			width: Number(obj.getAttribute("preview_width")),
			height: Number(obj.getAttribute("preview_height"))
		}},
		created: format.date(obj.getAttribute("created_at")),
		creator: { id: Number(obj.getAttribute("creator_id")) },
		children: obj.getAttribute("has_children") === "true" // TODO: define differently
	}),
	comment: (obj) => ({
		creator: {
			name: obj.getAttribute("creator"),
			id: Number(obj.getAttribute("creator_id"))
		},
		id: Number(obj.getAttribute("id")),
		body: obj.getAttribute("body")
	}),
	date: (input) => new class extends Date {
		constructor() {
			super(input);
		}

		toString() {
			const day = [
				"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
			][obj.getDay()];
			const month = [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			][obj.getMonth()];
			const date = String(obj.getDate()).padStart(2, "0");
		
			const hour = String(obj.getHours()).padStart(2, "0");
			const minute = String(obj.getMinutes()).padStart(2, "0");
			const second = String(obj.getSeconds()).padStart(2, "0");
		
			const zone = (() => {
				const zone = obj.getTimezoneOffset();
				const pos = zone >= 0 ? "+" : "-";
				const num = String(Math.abs(zone)).padStart(4, "0");
				return pos + num;
			})();
			const year = String(obj.getFullYear());

			return `${day} ${month} ${date} ${hour}:${minute}:${second} ${zone} ${year}`;
		}
	}
};

const parse = {
	xml: (obj) => new DOMParser().parseFromString(obj, "text/xml")
};