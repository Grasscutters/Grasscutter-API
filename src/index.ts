/**
 * Configures the application.
 * @param express The Express application.
 */
function configure(express: Express): void {
    // Configure the viewing engine.
    express.engine("html", require("ejs").renderFile);
    express.set("view engine", "html");
    // Configure the views.
    express.set("views", `${__dirname}/../views`);

    // Configure the middleware.
    express.use(require("body-parser").json({
        limit: constants.MAX_BODY_SIZE
    }));

    express.use(require("express-fileupload")());
    express.use(require("./middleware/accessible").check);

    // Add HTTP routes.
    express.use('/game', require("./routes/game").default);
    express.use('/config', require("./routes/config").default);
    express.use('/updater', require("./routes/updater").default);
    express.use('/cultivation', require("./routes/cultivation").default);
}

/* Configure 'dotenv'. */
import "dotenv/config";
/* Import constants. */
import constants from "./utils/constants";

/* Create directories. */
import {existsSync, mkdirSync} from "fs";

if(!existsSync(constants.CONTENT_DIRECTORY))
    mkdirSync(constants.CONTENT_DIRECTORY, {recursive: true});
if(!existsSync(constants.UPDATES_DIRECTORY))
    mkdirSync(constants.UPDATES_DIRECTORY, {recursive: true});

/* Load data. */
require("./utils/constants").reload();
/* Start the GitHub refresh. */
require("./utils/github").startRefresh();

/* Configure HTTP. */
import express, {Express} from "express";
import {createServer, Server} from "http";

/* Create Express application. */
const app: Express = express();

/* Configure the Express application. */
configure(app);

/* Start the HTTP server. */
import {startServer} from "./utils/callbacks";

const httpServer: Server = createServer(app);
httpServer.listen(constants.SERVER_PORT, startServer);