import {Request, Response} from "express";
import {ACCESS_DENIED, ALLOWED_IPS} from "../constants";

import {config} from "../config";

import {getAddress} from "../utils";

/**
 * @route /content/
 */

export function indexEndpoint(req: Request, res: Response) {
    // Check if the accessor is whitelisted.
    if(!ALLOWED_IPS.includes(getAddress(req)))
        return res.status(403).send(ACCESS_DENIED);

    // Send the content.html file.
    res.render("content");
}

/**
 * Serves the most up-to-date background file.
 * @route /content/bgfile
 */

export function backgroundEndpoint(req: Request, res: Response) {
    // Get the background file URL & redirect.
    res.redirect(config.bgFileUrl);
}