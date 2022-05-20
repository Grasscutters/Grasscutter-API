import {Request, Response} from "express";

import {writeFileSync} from "fs";

/**
 * @route /configuration/refresh
 */

export function refreshEndpoint(req: Request, res: Response) {
    res.status(200).send({
        msg: "Refreshed configuration.",
        config: {}
    });
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
        refreshed: req.query.refresh ? {} : false
    });
}