import {Request, Response} from "express";
import {FileArray, UploadedFile} from "express-fileupload";
import {UploadData, GameData} from "../interfaces";
import {Configuration} from "../config";
import {CONFIG_FILE, DOWNLOAD_DIRECTORY} from "../constants";

import * as config from "../config";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {refreshGameCache} from "../cache";

/**
 * @route /configuration/refresh
 */

export function refreshEndpoint(req: Request, res: Response) {
    res.status(200).send({
        msg: "Refreshed configuration.",
        config: config.loadConfig()
    });
}

/**
 * @route /configuration/update
 * @param refresh Should the configuration be refreshed?
 * @body A JSON object.
 */

export function updateEndpoint(req: Request, res: Response) {
    const body: Configuration = req.body;
    writeFileSync(CONFIG_FILE, JSON.stringify(body));

    res.status(200).send({
        msg: "Updated configuration.",
        refreshed: req.query.refresh ? (config.loadConfig() != undefined) : false
    });
}

/**
 * @route /configuration/upload
 * @body A JSON object.
 * @file An executable file.
 */

export function uploadEndpoint(req: Request, res: Response) {
    const files: FileArray = req.files;
    const uploaded: UploadedFile = <UploadedFile> files.file;
    const {version, app} = <UploadData> req.body;

    if(!uploaded) {
        res.status(400).send({
            msg: "No file or data provided."
        }); return;
    }

    const path: string = `${DOWNLOAD_DIRECTORY}/${app}/${version}`;
    !existsSync(path) && mkdirSync(path, {recursive: true});
    writeFileSync(`${path}/${uploaded.name}`, uploaded.data);

    res.status(200).send({
        msg: "Uploaded."
    });
}

/**
 * @route /configuration/game
 * @body A JSON object.
 */

export function gameEndpoint(req: Request, res: Response) {
    const body: GameData = req.body;
    writeFileSync('game-data.json', JSON.stringify(body));

    refreshGameCache(); // Refresh the game cache after saving it.

    res.status(200).send({
        msg: "Updated game data.",
    });
}