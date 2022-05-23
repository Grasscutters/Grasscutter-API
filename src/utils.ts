/**
 * Base64 encodes an object.
 * @param data The object to encode.
 */
import {Request} from "express";

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