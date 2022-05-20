import {Request, Response, Router} from "express";
import express from "express";

import {CultivationQuery} from "../interfaces";
import {DEFAULT_RESPONSE} from "../constants";
import {cache} from "../cache";

import {base64Encode, getSetting} from "../utils/utils";

const router: Router = express.Router();

/**
 * @route /cultivation/
 */

router.all('/', (req: Request, res: Response) => {
    res.send(DEFAULT_RESPONSE);
});

/**
 * @route /cultivation/query/
 */

router.get('/query', async (req: Request, res: Response) => {
    const bg_file = await getSetting("CULTIVATION_BGFILE");

    res.send(<CultivationQuery> {
        version: cache.version,
        commits: base64Encode(cache.commits),
        bg_file
    });
});

export default router;