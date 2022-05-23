import {Request, Response} from "express";
import {CultivationQuery} from "../interfaces";
import {DEFAULT_RESPONSE} from "../constants";

import {config} from "../config";
import {cache} from "../cache";

import {base64Encode} from "../utils";

/**
 * @route /cultivation/
 */

export function indexEndpoint(req: Request, res: Response) {
    res.send(DEFAULT_RESPONSE);
}

/**
 * @route /cultivation/query/
 */

export function queryEndpoint(req: Request, res: Response) {
    res.send(<CultivationQuery> {
        bg_file: config.bgFile || "",
        version: cache.version,
        commits: base64Encode(cache.commits)
    });
}