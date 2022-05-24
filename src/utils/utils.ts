/**
 * Base64 encodes an object.
 * @param data The object to encode.
 */
import {Request} from "express";
import Snowflake, {SnowflakeOptions} from "snowflake-id"
import {loadConfig as Config} from "../config";
import settings from "../database/model/settings";
import Logger from "./logger";

export function base64Encode(data: object): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Base64 decodes an object.
 * @param data The object to decode.
 */
export function base64Decode(data: string): object {
    return JSON.parse(Buffer.from(data, 'base64').toString());
}

/**
 * Attempt to return the real IP address of the request.
 * @param request The request to get the IP address of.
 */
export function getAddress(request: Request): string {
    let ip: string = request.socket.remoteAddress;
    ip = ip.replace('::ffff:', '');

    // Check if the address is localhost.
    if (ip == '127.0.0.1') {
        ip = (<string> request.headers['cf-connecting-ip']) || (<string> request.headers['x-real-ip']) || request.ip;
    } return ip;
}

export function generateId(): String {
    var snowflake : Snowflake = new Snowflake(<SnowflakeOptions>{
        mid: Config().machineId,
        offset: (2022-1970)*31536000*1000
    });

    return snowflake.generate();
}

export function toFileName(str : String) : String {
    return str.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function getSetting(id : String) : Promise<String | Number | Boolean> {
    var setting = await settings.findById(id);
    
    if(!setting) {
        throw `Unable to fetch setting by the id ${id}`;
    }

    if(setting.type === "boolean") {
        return setting.value.toLowerCase() === "true" ? true : false;
    } else if (setting.type === "string") {
        return setting.value;
    } else if (setting.type === "number") {
        return parseInt(setting.value);
    } else if (setting.type === "float") {
        return parseFloat(setting.value);
    }

    throw `Invalid type for setting ${id}`;
}