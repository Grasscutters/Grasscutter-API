import {Request, Response} from "express";

import {gameDataCache} from "../cache";

/**
 * @route /game/download
 */

export function downloadEndpoint(req: Request, res: Response) {
    res.status(200).send(gameDataCache);
}