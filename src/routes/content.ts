import {Request, Response} from "express";
import {DEFAULT_RESPONSE} from "../constants";

/**
 * @route /content/
 */

export function indexEndpoint(req: Request, res: Response) {
    res.send(DEFAULT_RESPONSE);
}

/**
 * Serves the most up-to-date background file.
 * @route /content/bgfile
 */

export function backgroundEndpoint(req: Request, res: Response) {
    res.sendFile(`${process.cwd()}/bgfile.png`);
}