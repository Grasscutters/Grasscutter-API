import {Request} from "express";

import Snowflake, {SnowflakeOptions} from "snowflake-id";
import settings from "../database/model/settings";

import CryptoJS from "crypto-js";
import * as constants from "../constants";

/**
 * Base64 encodes an object.
 * @param data The object to encode.
 */
export function base64Encode(data: object): string {
	return Buffer.from(JSON.stringify(data)).toString("base64");
}

/**
 * Base64 decodes an object.
 * @param data The object to decode.
 */
export function base64Decode(data: string): object {
	return JSON.parse(Buffer.from(data, "base64").toString());
}

/**
 * Attempt to return the real IP address of the request.
 * @param request The request to get the IP address of.
 */
export function getAddress(request: Request): string {
	let ip: string = request.socket.remoteAddress;
	ip = ip.replace("::ffff:", "");

	// Check if the address is localhost.
	if (ip == "127.0.0.1") {
		ip = <string>request.headers["cf-connecting-ip"] || <string>request.headers["x-real-ip"] || request.ip;
	} return ip;
}

/**
 * Generates a random snowflake.
 */
export function generateId(): string {
	const snowflake: Snowflake = new Snowflake(<SnowflakeOptions> {
		mid: constants.MACHINE_ID,
		offset: (2022 - 1970) * 31536000 * 1000,
	}); return snowflake.generate();
}

/**
 * Formats a string into a valid file name.
 * @param str The string to format.
 */
export function formatFileName(str: string): string {
	return str.replace(/[^a-zA-Z\d]/g, "_");
}

/**
 * Returns the value of the setting.
 * @param id The ID of the setting.
 */
export async function getSetting(id: String): Promise<any> {
	const setting = await settings.findById(id);
	if (!setting)
		throw `Unable to fetch setting by the id ${id}`;
	
	return setting.value;
}

/**
 * Encrypts the given value.
 * @param str The value to encrypt.
 */
export function encrypt(str: string): string {
	return CryptoJS.AES.encrypt(str as string, constants.ENCRYPTION_KEY).toString();
}

/**
 * Decrypts the given value.
 * @param str The value to decrypt.
 */
export function decrypt(str: string): string {
	const bytes = CryptoJS.AES.decrypt(str as string, constants.ENCRYPTION_KEY);
	return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Generates a random string with the given length.
 * @param length The length of the string.
 */
export function generateString(length: number) {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += constants.VALID_CHARACTERS.charAt(Math.floor(Math.random() * constants.VALID_CHARACTERS.length));
	} return result;
}
