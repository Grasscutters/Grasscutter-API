import {Request, Response} from "express";
import express from "express";

import {UploadedFile} from "express-fileupload";
import {RmDirOptions} from "fs";
import Plugin from "../database/model/plugins";
import Logger from "../utils/logger";

import {generateId, getSetting} from "../utils/utils";
import {indexValidation, newPluginValidation} from "../utils/validation/pluginValidation";
import {getUserById} from "../database/model/users";
import {getPluginById} from "../database/model/plugins";
import validateToken from "../middleware/userValidator";
import {mkdirSync, rmdirSync} from "fs";

import * as util from "util";

const router: express.Router = express.Router();

/**
 * List all the plugins hosted on the API.
 * @route /plugins/
 */

router.get('/', async (req: Request, res: Response) => {
    let { error } = indexValidation(req.body);
    if(error) {
        Logger.error(error.details[0].message + " | " + util.inspect(req.body));
        return res.send({ success: false, error: "VALIDATION_ERROR", message:  error.details[0].message});
    }

    let paginateLimit : number = parseInt(req.body.paginateLimit as string) || 20;
    let page : number = parseInt(req.query.page as string) || 1;

    const pluginsList = await Plugin.find().limit(paginateLimit).skip((paginateLimit * page) - paginateLimit);

    res.send({
        success: true, 
        plugins: pluginsList
    });
});

/**
 * Upload a plugin to the API.
 * @route /plugins/
 */

router.post('/', validateToken, async (req: Request, res: Response) => {
    const user = await getUserById((req as any).user.id);

    console.log(req.body)
    if(!req.body.data) {
        return res.send({ success: false, error: "VALIDATION_ERROR", message: "Data required"});
    }

    let data;
    let error;

    try {
        data = JSON.parse(req.body.data);
        error = newPluginValidation(data).error;
    } catch (e) {
        console.log(req.body);
        console.log(e);
        return res.send({ success: false, error: "VALIDATION_ERROR", message: "Data is in an incorrect format"})
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
    if(file.mimetype != 'application/java-archive') { // May add more MIME types later if people add support for other types of plugins (such as Kotlin)
        return res.status(500).send({success: false, error: "INVALID_MIME"});
    }

    let pluginId = generateId();
    let pluginPath = process.cwd() + `/data/plugins/${pluginId}`;
    let versionPath = pluginPath + `/${data.version}`
    let uploadPath = versionPath + "/" + file.name;

    mkdirSync(versionPath, {recursive: true});    

    file.mv(uploadPath, async (err) => {
        if(err) {
            Logger.error(`Unable to upload file '${uploadPath}'. \n` + err)
            rmdirSync(pluginPath, <RmDirOptions>{recursive: true});
            return res.status(500).send({success: false, error: "UPLOAD_ERROR"});
        }

        let newPlugin = new Plugin({
            _id: pluginId,
            name: data.name,
            description: data.description,
            summary: data.summary,
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
            createdBy: user._id
        });
        console.log(data.links)
        
        try {
            const savedPlugin = await newPlugin.save();
            return res.send({ success: true, plugin: savedPlugin });
        } catch (err) {
            Logger.error("Unable to save plugin to database.\n" + err);
            rmdirSync(pluginPath, <RmDirOptions>{recursive: true});
            return res.send({ success: false, error: "DB_ERROR" });
        }
    });
});

/**
 * Get a plugin by its ID.
 * @route /plugins/{id}
 */

router.get('/:id', async (req: Request, res: Response) => {
    let pluginId = req.params.id;

    const fetchedPlugin = await getPluginById(pluginId);

    if(!fetchedPlugin) {
        return res.status(404).send({success: false, error: "PLUGIN_NOT_FOUND" });
    }

    const user = await getUserById(fetchedPlugin.createdBy);

    const plugin = {
        id: fetchedPlugin._id,
        name: fetchedPlugin.name,
        summary: fetchedPlugin.summary,
        description: fetchedPlugin.description,
        dateReleased: fetchedPlugin.dateReleased,
        latestVersion: fetchedPlugin.versions[fetchedPlugin.latestVersion],
        versions: Object.keys(fetchedPlugin.versions),
        links: fetchedPlugin.links,
        createdBy: {
            id: user._id,
            username: user.username
        }
    };

    res.send({success: true, plugin});
});

/**
 * Update a plugin on the API.
 * @route /plugins/{id}
 */

router.post('/:id', async (req: Request, res: Response) => {
    const plugin = await getPluginById(req.params.id);
    res.send({success: false, error: "todo..."})
});

/**
 * Fetch specific version details for a plugin by ID.
 * "latest" works in place of a version number to fetch the latest version
 * @route /plugins/{id}/{version}
 */

router.get('/:id/:version', async (req: Request, res: Response) => {
    const plugin = await getPluginById(req.params.id);
    let version;

    if(!plugin) {
        return res.status(404).send({success: false, error: "PLUGIN_NOT_FOUND" });
    }

    if(req.params.version == "latest") {
        version = plugin.versions[plugin.latestVersion];
        version.versionNumber = plugin.latestVersion;
    } else {
        version = plugin.versions[req.params.version];
        version.versionNumber = req.params.version;
    }

    if(!version) {
        return res.status(404).send({success: false, error: "VERSION_NOT_FOUND" });
    }
    
    return res.send({ success: true, version });
});

/**
 * Download the plugin JAR from the specified version.
 * "latest" works in place of a version number to fetch the latest jar
 * @route /plugins/{id}/{version}/download
 */
router.get('/:id/:version/download', async (req: Request, res: Response) => {
    const plugin = await getPluginById(req.params.id);
    let version;

    if(!plugin) {
        return res.status(404).send({success: false, error: "PLUGIN_NOT_FOUND" });
    }

    if(req.params.version == "latest") {
        version = plugin.versions[plugin.latestVersion];
        version.versionNumber = plugin.latestVersion;
    } else {
        version = plugin.versions[req.params.version];
        version.versionNumber = req.params.version;
    }

    if(!version) {
        return res.status(404).send({success: false, error: "VERSION_NOT_FOUND" });
    }

    let pluginPath = process.cwd() + `/data/plugins/${plugin._id}`;
    let versionPath = pluginPath + `/${version.versionNumber}`;
    let uploadPath = versionPath + "/" + version.fileData.name;

    return res.download(uploadPath);
});

export default router;