import {Request, Response, Router} from "express";
import {FileArray, UploadedFile} from "express-fileupload";

import {Update} from "../utils/interfaces";
import constants from "../utils/constants";

import {writeFileSync, existsSync, mkdirSync} from "fs";

async function showPublishForm(req: Request, res: Response): Promise<void> {
    // Render the content upload form.
    res.render("upload-content");
}

async function publish(req: Request, res: Response): Promise<void> {
    // Grab upload parameters.
    const software: string = <string> (req.body.software || "game");
    const version: string = <string> (req.body.version || "latest");
    const notes: string = <string> (req.body.notes || "");
    let signature: string|undefined = (<string> req.body.signature || undefined);

    // Get the update data file path.
    const path: string = `${constants.UPDATES_DIRECTORY}/${software}`;
    // Create the directory for the update data if it doesn't exist.
    !existsSync(path) && mkdirSync(path, {recursive: true});

    // Get the uploaded file.
    const files: FileArray = req.files;
    // Check if the file exists.
    if(!files || !files.file) {
        res.status(404).send(constants.FILE_DOES_NOT_EXIST()); return;
    }

    // Get the uploaded file.
    const uploaded: UploadedFile = <UploadedFile> files.file;
    // Check if the file needs a signature.
    if(signature == undefined) {
        // Set the signature to the file's MD5 hash.
        signature = uploaded.md5;
    }

    // Write the file to the file system.
    writeFileSync(`${path}/${uploaded.name}`, uploaded.data);

    // Compute and write data.
    const data: object|Update = {
        url: `https://api.grasscutter.io/updater/${software.toLowerCase()}?version=${version}`,
        signature, version, file: uploaded.name, notes, pub_date: Date.now()
    };
    writeFileSync(`${path}/${version}.json`, JSON.stringify(data, null, 2));

    // Respond with a success message.
    res.status(200).send(constants.OPERATION_SUCCESSFUL());
}

async function fetch(req: Request, res: Response): Promise<void> {
    // Get the requested software.
    const software: string = <string> (req.params.software || "game");
    // Get the requested version.
    const version: string = <string> (req.query.version || "latest");

    // Get the update data file path.
    const path: string = `${constants.UPDATES_DIRECTORY}/${software}/${version}.json`;
    // Check if the file exists.
    if(!existsSync(path)) {
        res.status(404).send(constants.FILE_DOES_NOT_EXIST()); return;
    }

    // Return the update data file.
    res.status(200).sendFile(path);
}

async function update(req: Request, res: Response): Promise<void> {
    // Get the requested software.
    const software: string = <string> (req.params.software || "game");
    // Get the requested version.
    const version: string = <string> (req.query.version || "latest");

    // Get the new update data.
    const newUpdate: object = req.body;

    // Get the update data file path.
    const path: string = `${constants.UPDATES_DIRECTORY}/${software}/${version}.json`;
    // Check if the file exists.
    if(!existsSync(path)) {
        res.status(404).send(constants.FILE_DOES_NOT_EXIST()); return;
    }

    // Write the new update data to the file.
    writeFileSync(path, JSON.stringify(newUpdate, null, 2));

    // Respond with a success message.
    res.status(200).send(constants.OPERATION_SUCCESSFUL());
}

/* Create a router object. */
const router: Router = Router();

/**
 * @route /updater/publish
 */
router.get('/publish', showPublishForm);

/**
 * @route /updater/publish
 * @param software The software to publish an update for.
 * @param version The version of the software to publish an update for.
 * @param notes The notes for the update.
 * @param signature? The signature of the update. Auto-computed in MD5 if not specified.
 * @body The update data.
 * @file The update file.
 */
router.post('/publish', publish);

/**
 * @route /updater/
 * @param software The software to fetch the update data for.
 * @param version The version of the software to fetch the update data for.
 */
router.get('/:software', fetch);

/**
 * @route /updater/
 * @param software The software to modify an existing update for.
 * @param version The version of the software to modify the update for.
 * @body The new update data.
 */
router.patch('/:software', update);

/* Return the router. */
export default router;