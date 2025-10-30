import { Enum, objectAssignRecursive } from "../util/index.js";
import { ChipbooruError } from "../main/error.js";
import { getApiKey } from "../main/apiKey.js";
import { DOMParser } from "xmldom";

export async function get(input, options) {
	const id = (typeof input === "string")
		? Number(input.match(/^(?:id:)?(\d+)$/)?.at(1))
		: Number(input);

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
	]).then(promise => ({
		json: promise[0],
		xml: promise[1],
		comments: promise[2],
		children: promise[3]
	}));

	if (response.json === null) return null;

	const obj = {};

	assign.initial(response.json[0], obj);
	assign.xml(response.xml.childNodes[0], obj);
	assign.comments(response.comments, obj);
	assign.children(response.children, obj);

	return new Rule34Post(obj);
}

export async function search(input, options) {
	if (options?.limit > 1000)
		ChipbooruError.warn("_TEMP");

	const query = String(input);
	
	if (options?.jsonOnly) {
		const array = await draw.post({
			tags: query,
			json: true,
			limit: options?.limit ?? null,
			pid: options?.pid ?? 1
		});
		
		return new Rule34Search(/* TODO */);
	}
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

		if (!options?.method || (!options.method?.json && !options.method?.xml && !options.method?.comment)) {
			options ??= {};
			options.method ??= {};
			options.method.json = true;
		}

		const promises = [
			options?.method?.json && draw.post({
				limit: 1,
				json: true,
				tags: `id:${id}`
			}),
			options?.method?.xml && draw.post({
				limit: 1,
				json: false,
				tags: `id:${id}`
			}),
			options?.method?.comment && draw.comments({
				post_id: id
			})
		];

		return await Promise.all(promises).then(array => {
			const response = {};
			if (array[0]) response.json = array[0];
			if (array[1]) response.xml = array[1];
			if (array[2]) response.comment = array[2];

			return response;
		});
	}
};

export const postRating = new Enum({
	0: "safe",
	1: "questionable",
	2: "explicit"
}, { "s": 0, "q": 1, "e": 2 });

// TODO: verify value names
export const postStatus = new Enum({
	0: "active",
	1: "flagged",
	2: "deleted"
});

export const tagType = new Enum({
	0: "copyright",
	1: "character",
	2: "artist",
	3: "general",
	4: "metadata",
	5: null
}, { "tag": 3 });

class Rule34Post {
	constructor(obj) {
		Object.assign(this, obj);
	}

	async getXML() {
		const obj = await draw.post({
			limit: 1,
			json: false,
			tags: `id:${this.id}`
		});

		assign.xml(obj.childNodes[0], this);
		return this;
	}

	async getComments() {
		const obj = await draw.comments({
			post_id: this.id
		});

		assign.comments(obj, this);
		return this;
	}

	async getChildren() {
		const obj = await draw.post({
			limit: 1000,
			json: true,
			tags: `parent:${this.id}`
		});

		assign.children(obj, this);
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

class Rule34Search {
	constructor(obj) {
		Object.assign(this, obj);
	}

	/* *[Symbol.iterator]() {
	} */
}

// create url with key-value parameters
const getUrl = {
	post: (params) => {
		const baseUrl = "https://api.rule34.xxx";
		const search = new URLSearchParams(params).toString();
		return `${baseUrl}?${search}`;
	},
	autocomplete: (params) => {

	}
};

// fetch data with few parameters
const draw = {
	async post(options) {
		const secret = getApiKey("rule34");

		if (!secret?.api_key)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "api_key"]);
		if (!secret?.user_id)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "user_id"]);
		
		const response = await fetch(getUrl.post({
			page: "dapi",
			s: "post",
			q: "index",
			limit: options?.limit ?? 50,
			pid: options?.pid ?? 1,
			json: Number(options?.json ?? false),
			fields: options?.json ? "tag_info" : "",
			tags: options?.tags ?? "",
			api_key: secret.api_key,
			user_id: secret.user_id
		}));

		if (response.headers.get("content-type").match(/application\/json/)) {
			const json = await parse.json(response);
			const noAuthMsg = "Missing authentication. Go to api.rule34.xxx for more information";
			if (json === noAuthMsg)
				ChipbooruError.throw("INVALID_APIKEY", "Rule34");
			else return json;
		} else if (response.headers.get("content-type").match(/text\/xml/))
			return await parse.xml(response);
	},
	async comments(options) {
		const secret = getApiKey("rule34");

		if (!secret?.api_key)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "api_key"]);
		if (!secret?.user_id)
			ChipbooruError.throw("NO_APIKEY", ["Rule34", "user_id"]);
		
		const response = await fetch(getUrl.post({
			page: "dapi",
			s: "comment",
			q: "index",
			post_id: options?.post_id,
			api_key: secret.api_key,
			user_id: secret.user_id
		}));

		return await parse.xml(response);
	}
};

// convert response objects to json/xml objects
const parse = {
	json: async (response) => {
		const text = await response.text();
		try {
			return JSON.parse(text);
		} catch (error) {
			return null;
		}
	},
	xml: async (response) => {
		const element = await response.text()
			.then(file => new DOMParser().parseFromString(file, "text/xml").documentElement);
		
		var index = 0;
		while (index < element.childNodes.length) {
			if (element.childNodes[index].nodeType !== 1) {
				element.removeChild(element.childNodes[index]);
			} else {
				index++;
			}
		}

		return element;
	}
};

// reformat disorganized objects into basic json
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
				// width: xml
				// height: xml
			},
			directory: obj.directory,
			name: obj.image,
			hash: obj.hash,
			extension: obj.image.match(/.*\.(.*)$/)[1]
		},
		id: obj.id,
		// created: xml
		updated: format.date(obj.change * 1000),
		creator: {
			name: obj.owner
			// id: xml
		},
		rating: postRating[obj.rating],
		score: obj.score,
		status: postStatus[obj.status],
		notes: obj.has_notes, // TODO: find out how to fetch note info
		parent: obj.parent_id,
		source: obj.source,
		comments: Array(obj.comment_count),
		tags: new class extends Array {
			constructor() {
				super();
				objectAssignRecursive(format.tags(obj.tag_info), this);
			}

			toString() {
				return obj.tags;
			}
		}
	}),
	jsons: (obj) => obj.map(item => format.json(item)),
	xml: (obj) => ({
		image: {
			main: {
				url: obj.getAttribute("file_url"),
				width: Number(obj.getAttribute("width")),
				height: Number(obj.getAttribute("height"))
			},
			sample: {
				url: obj.getAttribute("sample_url"),
				width: Number(obj.getAttribute("sample_width")),
				height: Number(obj.getAttribute("sample_height"))
			},
			thumbnail: {
				url: obj.getAttribute("preview_url"),
				width: Number(obj.getAttribute("preview_width")),
				height: Number(obj.getAttribute("preview_height"))
			}
		},
		id: obj.getAttribute("id"),
		created: format.date(obj.getAttribute("created_at")),
		updated: format.date(Number(obj.getAttribute("change")) * 1000),
		creator: {
			id: Number(obj.getAttribute("creator_id"))
		},
		rating: postRating[obj.getAttribute("rating")],
		score: Number(obj.getAttribute("score")),
		status: postStatus[obj.getAttribute("status")],
		notes: obj.getAttribute("has_notes") === "true",
		parent: Number(obj.getAttribute("parent_id")),
		source: obj.getAttribute("source")
	}),
	xmls: (obj) => Array.from(obj.childNodes).map(child => format.xml(child)),
	comment: (obj) => ({
		creator: {
			name: obj.getAttribute("creator"),
			id: Number(obj.getAttribute("creator_id"))
		},
		id: Number(obj.getAttribute("id")),
		body: obj.getAttribute("body")
	}),
	comments: (obj) => Array.from(obj.childNodes).map(child => format.comment(child)),
	tag: (obj) => {
		if (!Object.entries(tagType).map(entry => entry[0]).includes(obj.type))
			ChipbooruError.warn("UNKNOWN_TAG_TYPE", ["Rule34", obj]);
		else return {
			name: obj.tag,
			count: obj.count,
			type: tagType[obj.type]
		};
	},
	tags: (obj) => obj.map(tag => format.tag(tag)),
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


const assign = {
	initial: (obj, that) => {
		that.applied = {
			json: false,
			xml: false,
			comments: false,
			children: false
		};
		
		assign.json(obj, that);
	},
	json: (obj, that) => {
		if (that.applied.json) return;
		objectAssignRecursive(format.json(obj), that, { reassign: false });
		that.applied.json = true;
	},
	xml: (obj, that) => {
		objectAssignRecursive(format.xml(obj), that, { reassign: false });
		that.applied.xml = true;
	},
	comments: (obj, that) => {
		that.comments = format.comments(obj);
		that.applied.comments = true;
	},
	children: (obj, that) => {
		that.children = obj.map(post => post.id).filter(id => id !== that.id);
		that.applied.children = true;
	}
};