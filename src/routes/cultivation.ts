import {Request, Response, Router} from "express";

import {CultivationUpdate, Update} from "../utils/interfaces";
import constants, {cultivationData} from "../utils/constants";
import githubCache from "../utils/github";

import {existsSync} from "fs";

async function background(req: Request, res: Response): Promise<void> {
    // Get the background file URL & redirect.
    // The redirect here means it is temporary.
    res.redirect(307, cultivationData.defaultBg);
}

async function checkForUpdate(req: Request, res: Response): Promise<void> {
    // Get the launcher's current version.
    const version: string = <string> req.query.version;
    // Get the current version of the launcher.
    const currentVersion: string = <string> (githubCache.releases["cultivation"] || "1.0.0");

    // Check if the client is on the latest version.
    if(version == currentVersion) {
        res.status(204).send(constants.NO_UPDATE()); return;
    }

    // Get the path to the update file.
    const filePath: string = `${constants.UPDATES_DIRECTORY}/cultivation/${version}.json`;
    // Check if update exists.
    if(!existsSync(filePath)) {
        res.status(404).send(constants.FILE_DOES_NOT_EXIST()); return;
    }

    // Get the release data.
    const update: CultivationUpdate = require(filePath);

    // Send the update JSON to the client.
    res.status(200).send(<CultivationUpdate> {
        url: `https://api.grasscutter.io/cultivation/download?version=${update.version}`,
        version: update.version, notes: update.notes, pub_date: new Date(update.pub_date).toISOString()
    });
}

async function download(req: Request, res: Response): Promise<void> {
    // Get the requested version.
    const version: string = <string> (req.query.version || "1.0.0");
    // Get the path to the version file.
    const versionFile: string = `${constants.UPDATES_DIRECTORY}/cultivation/${version}.json`;

    // Check if the version file exists.
    if(!existsSync(versionFile)) {
        res.status(404).send(constants.FILE_DOES_NOT_EXIST()); return;
    }

    // Read the version data.
    const update: Update = require(versionFile);
    console.log(`${constants.UPDATES_DIRECTORY}/cultivation/${update.file}`);
    // Return the file & data.
    res.status(200).download(`${constants.UPDATES_DIRECTORY}/cultivation/${update.file}`, update.file);
}

export function query(req: Request, res: Response): void {
    res.status(200).send(githubCache);
}

/* Create a router object. */
const router: Router = Router();

/**
 * Redirects users to the official launcher's background image URL.
 * @route /cultivation/bgfile
 */
router.get('/bgfile', background);

/**
 * Checks if the launcher is on the latest version.
 * @route /cultivation/update
 * @param version The current version of the launcher.
 */
router.get('/updater', checkForUpdate);

/**
 * Returns the update for the launcher.
 * @route /cultivation/download
 * @param version? The version of the launcher to download.
 */
router.get('/download', download);

/**
 * Returns information for the launcher to render.
 * @route /cultivation/query
 */
router.get('/query', query);

/* Return the router. */
export default router;