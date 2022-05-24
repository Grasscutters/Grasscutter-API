import express from "express";
import {Request, Response} from "express";
import { UploadedFile } from "express-fileupload";
import util from "util";
import fs, { MakeDirectoryOptions } from "fs";

import plugin from "../database/model/plugins";
import Logger from "../utils/logger";
import { generateId, getSetting } from "../utils/utils";
import { indexValidation, newPluginValidation } from "../utils/validation/pluginValidation";

const router : express.Router = express.Router();

/**
 * @route /plugins/
 * List all the plugins hosted on the API
 */
router.get("/", async (req: Request, res: Response) => {
    let { error } = indexValidation(req.body);
    if(error) {
        Logger.error(error.details[0].message + " | " + util.inspect(req.body));
        return res.send({ success: false, error: "VALIDATION_ERROR", message:  error.details[0].message});
    }

    let paginateLimit : number = parseInt(req.body.paginateLimit as string) || 20;
    let page : number = parseInt(req.query.page as string) || 1;

    const pluginsList = await plugin.find().limit(paginateLimit).skip((paginateLimit * page) - paginateLimit);

    res.send({success: true, plugins: pluginsList});
});

/**
 * @route /plugins
 * Upload a plugin to the API
 */
 router.post("/", async (req: Request, res: Response) => {
    let data;
    let error;

    if(typeof req.body.data != "undefined") {
        data = JSON.parse(req.body.data);
        error = newPluginValidation(data).error;
    } else {
        data = JSON.parse(req.body);
        error = newPluginValidation(data).error;
    }

    if(error) {
        Logger.error(error.details[0].message + " | " + util.inspect(data));
        return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message});
    }

    if((await getSetting("PLUGINS_UPLOAD_ENABLED")) == false) {
        return res.send({ success: false, error: "PLUGIN_UPLOAD_DISABLED" });
    }

    if(Object.keys(req.files).length == 0 || typeof req.files.pluginJar == 'undefined' || !req.files.pluginJar) {
        return res.send({ success: false, error: "MISSING_FILE"});
    }

    let file = req.files.pluginJar as UploadedFile;
    if(file.mimetype != 'application/java-archive') {
        return res.status(500).send({success: false, error: "INVALID_MIME"});
    }

    let pluginId = generateId();
    let pluginPath = process.cwd() + `/data/plugins/${pluginId}`;
    let versionPath = pluginPath + `/${data.version}`
    let uploadPath = versionPath + "/" + file.name;

    fs.mkdirSync(versionPath, {recursive: true});    

    file.mv(uploadPath, async (err) => {
        if(err) {
            Logger.error(`Unable to upload file '${uploadPath}'. \n` + err)
            fs.rmdirSync(pluginPath, <fs.RmDirOptions>{recursive: true});
            return res.status(500).send({success: false, error: "UPLOAD_ERROR"});
        }

        let newPlugin = new plugin({
            _id: pluginId,
            name: data.name,
            description: data.description,
            dateReleased: Date.now(),
            latestVersion: data.version,
            versions: {
                [data.version]: {
                    changeLog: data.changeLog,
                    testedGCVersion: data.testedGCVersion,
                    supportedLanguages: data.supportedLanguages,
                    fileData: {
                        name: file.name,
                        mimetype: file.mimetype,
                        size: file.size,
                        md5: file.md5
                    }
                }
            },
            links: data.links,
            createdBy: "todo"
        });
        console.log(data.links)
        
        try {
            const savedPlugin = await newPlugin.save();
            return res.send({ success: true, plugin: savedPlugin });
        } catch (err) {
            Logger.error("Unable to save plugin to database \n" + error);
            fs.rmdirSync(pluginPath, <fs.RmDirOptions>{recursive: true});
            return res.send({ success: false, error: "DB_ERROR" });
        }

    });
});

/**
 * @route /plugins/{id}
 * Get a plugin by its ID
 */
router.get("/:id", async (req: Request, res: Response) => {
    let pluginId = req.params.id;

    const fetchedPlugin = await plugin.findById(pluginId);

    if(!fetchedPlugin) {
        return res.status(404).send({success: false, error: "PLUGIN_NOT_FOUND" });
    }

    res.send({success: true, plugin: fetchedPlugin });
});

/**
 * @route /plugins/{id}
 * Update a plugin on the API
 */
 router.post("/:id", (req: Request, res: Response) => {
    res.send({success: false, error: "todo..."})
});


export default router;