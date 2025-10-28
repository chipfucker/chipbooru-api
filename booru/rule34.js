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
			if (array[0]) response.json = array[0];
			if (array[1]) response.xml = array[1];
			if (array[2]) response.comment = array[2];

			return response;
		});
	}
}

class Rule34Post {
	constructor(obj) {
		Object.assign(this, obj);
		this.hasXml = false;
	}

	async getXML(obj) {
		if (!this.hasXml) return this;

		obj ??= await draw.post({
			limit: 1,
			json: false,
			tags: `id:${this.id}`
		}).then(doc => doc.getElementsByTagName("post")[0]);

		format.xml(this, obj);
		this.hasXml = true;

		return this;
	}

	toString() {
		return `[${this.id} Rule34Post]`;
		/* Could also be:
		 * [object Rule34Post]
		 * [5823623 Rule34Post]
		 * https://rule34.xxx?...
		 */
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
	}
}

const format = {
	initial: (obj) => ({
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
				extension: obj.image.match(/.*\.(.*)$/)[1]
			},
			id: obj.id,
			created: undefined,
			updated: format.date(obj.change * 1000),
			creator: {
				name: obj.owner,
				id: undefined
			},
			rating: obj.rating,
			score: obj.score,
			status: obj.status,
			notes: obj.has_notes, // TODO: find out how to fetch note info
			parent: obj.parent_id,
			source: obj.source,
			comments: Array(obj.comment_count)
	}),
	xml: (that, obj) => {
		that.image.thumbnail.width = Number(obj.getAttribute("preview_width"));
		that.image.thumbnail.height = Number(obj.getAttribute("preview_height"));
		that.created = format.date(obj.getAttribute("created_at"));
		that.creator.id = Number(obj.getAttribute("creator_id"));
		that.children = obj.getAttribute("has_children") === "true";
	},
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
}