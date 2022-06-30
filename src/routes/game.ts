import {Request, Response, Router} from "express";

import constants, {gameVersionData} from "../utils/constants";

import {toVersionNumber} from "../utils/math";

async function download(req: Request, res: Response): Promise<void> {
    // Fetch the latest version or specified version of the game.
    const version: string = <string> (req.query.version || gameVersionData.latest);
    // Respond with the requested game version object.
    res.status(302).send(gameVersionData.versions[version]);
}

async function update(req: Request, res: Response): Promise<void> {
    // Get the current version of the game.
    const current: string = <string> (req.params.curVer || gameVersionData.latest);
    // Fetch the latest version or specified version of the game.
    const update: string = <string> (req.query.version || gameVersionData.latest);

    // Compare the game versions.
    if(toVersionNumber(current) >= toVersionNumber(update)) {
        res.status(204).send(constants.NO_UPDATE()); return;
    }

    // Return the patch data for the version.
    res.status(302).send(gameVersionData.patches[update]);
}

/* Create a router object. */
const router: Router = Router();

/**
 * @route /game/download
 */
router.get('/download', download);

/**
 * @route /game/download
 * @param version The game version to download.
 */
router.get('/download/:version', download);

/**
 * @route /game/update
 * @param curVer The current game version.
 */
router.get('/update', update);

/**
 * @route /game/update
 * @param version The game version to update to.
 * @param curVer The current game version.
 */
router.get('/update/:version', update);

/* Return the router. */
export default router;