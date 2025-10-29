import { ChipbooruError } from "./error.js";

const supported = [
	"rule34"
];

const planned = [
	"e621", "safebooru"
];

/* IMAGEBOARDS SUPPORTED BY GRABBER:
 * anime-pictures.net
 * api.rule34.xxx
 * behoimi.org
 * booru.io
 * danbooru.donmai.us
 * derpibooru.org
 * e-hentai.org
 * e621.net
 * exhentai.org
 * gelbooru.com
 * hijiribe.donmain.us
 * kemono.su
 * konachan.com
 * nhentai.net
 * nijie.info
 * pawoo.net
 * rule34.paheal.net
 * rule34.us
 * safebooru.org
 * sonohara.donmai.us
 * tentaclerape.net
 * wallhaven.cc
 * www.artstation.com
 * www.deviantart.com
 * www.newgrounds.com/art
 * www.pixiv.net
 * www.reddit.com
 * www.zerochan.net
 * yande.re
 */

var keys = {};

export function getApiKey(booru) {
	return keys[booru];
}

export function setApiKey(data) {
	if (data === undefined)
		ChipbooruError.throw("SETKEY_NO_PARAM");
	if (data.constructor.name !== "Object")
		ChipbooruError.throw("SETKEY_NOT_OBJECT");

	const unsupported = Object.getOwnPropertyNames(data).filter(key => planned.includes(key));
	const unrecognised = Object.getOwnPropertyNames(data).filter(key => ![ ...supported, ...planned ].includes(key));

	if (unrecognised.length)
		ChipbooruError.warn("IMAGEBOARD_NOT_SUPPORTED", unrecognised[0]);
	if (unsupported.length)
		ChipbooruError.warn("IMAGEBOARD_NOT_SUPPORTED_YET", unsupported[0]);

	Object.assign(keys, data);
}