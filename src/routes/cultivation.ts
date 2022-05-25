import express from "express";
import {Request, Response, Router} from "express";
import {CultivationQuery} from "../interfaces";
import {DEFAULT_RESPONSE} from "../constants";

import {cache} from "../cache";

import {base64Encode, getSetting} from "../utils/utils";

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
router.get("/query", async (req: Request, res: Response) => {
    var bg_file = await getSetting("CULTIVATION_BGFILE");
    
    res.send(<CultivationQuery> {
        bg_file,
        version: cache.version,
        commits: base64Encode(cache.commits)
    });
});

export default router;