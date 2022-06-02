import {Request, Response} from "express";
import {BackgroundUpdate} from "../interfaces";

import * as config from "../config";
import {writeFileSync} from "fs";

/**
 * @route /configuration/refresh
 */

export function refreshEndpoint(req: Request, res: Response) {
    res.status(200).send({
        msg: "Refreshed configuration.",
        config: config.loadConfig()
    })
}

/**
 * @route /configuration/update
 * @param refresh Should the configuration be refreshed?
 * @body A JSON object.
 */

export function updateEndpoint(req: Request, res: Response) {
    const body: object = req.body;
    writeFileSync('config.json', JSON.stringify(body));

    res.status(200).send({
        msg: "Updated configuration.",
        refreshed: req.query.refresh ? (config.loadConfig() != undefined) : false
    });
}

/**
 * Sets the background file served in `/content/bgfile`
 * @route /configuration/background
 * @body A JSON object with a base64 encoded image.
 */

export function backgroundEndpoint(req: Request, res: Response) {
    const body: BackgroundUpdate = req.body;

    // Save the image to the file system.
    const image: string = body.data;
    const imageBuffer: Buffer = Buffer.from(image, 'base64');
    writeFileSync('bgfile.png', imageBuffer);

    res.status(200).send({
        msg: "Updated background."
    });
}