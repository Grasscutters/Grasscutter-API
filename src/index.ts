/* Configure 'dotenv'. */
import "dotenv/config";

/* Configure caching system. */
import {refreshCache, refreshGameCache} from "./cache";
refreshCache().then(() => setInterval(refreshCache, 1000 * 60 * 60));
refreshGameCache();

/* Load configuration. */
require("./config").loadConfig();

/* Configure HTTP. */
import * as constants from "./constants";
import express, {Express} from "express";
import {createServer, Server} from "http";

const app: Express = express();

/* Configure views. */
app.engine("html", require("ejs").renderFile);
app.set("views", `${__dirname}/views`);
app.set("view engine", "html");

/* Configure middleware. */
import * as bodyParser from "body-parser";
app.use(bodyParser.json({limit: constants.MAX_BODY_SIZE}));

import fileUpload from "express-fileupload";
app.use(fileUpload());

import {validateAdminEndpoints} from "./middleware/adminValidator";
app.use(validateAdminEndpoints);

/* Import the router. */
require("./routes/router").configureApp(app);

/* Check if directories exist. */
import {existsSync, mkdirSync} from "fs";
if(!existsSync(constants.DOWNLOAD_DIRECTORY))
    mkdirSync(constants.DOWNLOAD_DIRECTORY, {recursive: true});

/* Start HTTP server. */
const server: Server = createServer(app);
server.listen(constants.SERVER_PORT, () => console.log(`Server listening on port ${constants.SERVER_PORT}`));