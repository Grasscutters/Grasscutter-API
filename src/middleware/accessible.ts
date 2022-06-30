import {Request, Response, NextFunction} from "express";

import constants from "../utils/constants";

export function check(req: Request, res: Response, next: NextFunction) {
    // Get the request path.
    const path = req.path;

    // Check if path is to an admin endpoint.
    if(!path.startsWith('/configuration') && !path.startsWith('/updater')) {
        next(); return; // Continue if not.
    }

    // Check if the accessor is whitelisted.
    if(!constants.ALLOWED_ADDRESSES.includes(getRealAddress(req)))
        return res.status(403).send(constants.ACCESS_DENIED());

    next(); // Call next method.
}

/**
 * Gets the real IP address of a request.
 * @param req The Express request object.
 * @return The real IP address of the request.
 */
function getRealAddress(req: Request): string {
    let address: string = req.socket.remoteAddress;
    address = address.replace('::ffff:', '');

    // Check if the address is localhost.
    if (address == '127.0.0.1') {
        address = (<string> req.headers['cf-connecting-ip']) ||
            (<string> req.headers['x-real-ip']) || req.ip;
    }

    // Return the real IP address.
    return address;
}