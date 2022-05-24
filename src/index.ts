import "dotenv/config";
import chalk from 'chalk';
import figlet from 'figlet';
import express, {Express} from "express";
import {Server} from "http";
import helmet from "helmet";
import * as bodyParser from "body-parser";
import { AddressInfo } from "net";
import fileUpload from "express-fileupload";

import * as database from "./database";
import Logger from "./utils/logger";
import morganLogger from './utils/morgan-logger';
import {validateAdminEndpoints} from "./middleware/adminValidator";
import * as Config from "./config";
import * as constants from "./constants";
import * as Router from "./routes/router";

/* Configure caching system. */
import {refreshCache} from "./cache";
import path from "path";
refreshCache().then(() => setInterval(refreshCache, 1000 * 60 * 60));

/* Load configuration. */
Config.loadConfig();

const app: Express = express();

console.clear();
console.log(chalk.green(figlet.textSync("Grasscutter-API")));

function startServer() {
    database.connect(constants.MONGO_URL);

    // Configure Middleware
    app.use(morganLogger);
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(fileUpload());

    // TEST
    app.get("/test", (req, res) => {
		res.set("Content-Security-Policy", "default-src 'self' 'unsafe-inline';");
		res.sendFile(path.join(__dirname, "../frontend/index.html"));
	});

    app.get("/axios.min.js", (req, res) => {
		res.set("Content-Security-Policy", "default-src 'self' 'unsafe-inline';");
		res.sendFile(path.join(__dirname, "../frontend/axios.min.js"));
	});

    // Import the router.
    Router.configureApp(app);

    app.use(validateAdminEndpoints);

    var listener : Server = app.listen(constants.SERVER_PORT, () => {
        Logger.log("info", `Express is running on port ${(listener.address() as AddressInfo).port}`)
    });
}

startServer();