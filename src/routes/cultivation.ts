import {Request, Response} from "express";
import {DEFAULT_RESPONSE} from "../constants";

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
    res.send(DEFAULT_RESPONSE);
}