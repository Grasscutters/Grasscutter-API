import express from "express";
import {Request, Response, Router} from "express";
import {CultivationQuery} from "../interfaces";
import {DEFAULT_RESPONSE} from "../constants";

import {config} from "../config";
import {cache} from "../cache";

import {base64Encode} from "../utils/utils";

const router : express.Router = express.Router();

/**
 * @route /cultivation/
 */
router.all("/", (req: Request, res: Response) => {
    res.send(DEFAULT_RESPONSE);
});

/**
 * @route /cultivation/query/
 */
router.get("/query", (req: Request, res: Response) => {
    res.send(<CultivationQuery> {
        bg_file: config.bgFile || "",
        version: cache.version,
        commits: base64Encode(cache.commits)
    });
});

export default router;