import {Request, Response} from "express";
import {CultivationQuery} from "../interfaces";
import {DEFAULT_RESPONSE, DOWNLOAD_DIRECTORY} from "../constants";

import {cache} from "../cache";

import {base64Encode} from "../utils";
import {existsSync} from "fs";

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
        version: cache.version,
        commits: base64Encode(cache.commits)
    });
}

/**
 * @route /cultivation/download
 * @route /cultivation/download/:version
 * @param version? The version of the launcher to download.
 */

export function downloadEndpoint(req: Request, res: Response) {
    const version: string = req.params.version || cache.version.cultivation;
    const filePath: string = `${DOWNLOAD_DIRECTORY}/cultivation/${version}/${version}.zip`;

    if(existsSync(filePath))
        res.download(filePath);
    else res.status(400).send("File not found.");
}