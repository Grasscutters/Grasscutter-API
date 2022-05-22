/* Configure 'dotenv'. */
import "dotenv/config";

import * as constants from "./constants";
import express, {Express} from "express";
import {createServer, Server} from "http";

/* Express instance. */
const app: Express = express();

/* Configure middleware. */
import * as bodyParser from "body-parser";
app.use(bodyParser.json());

import {validateAdminEndpoints} from "./middleware/adminValidator";
app.use(validateAdminEndpoints);

/* Import the router. */
require("./routes/router").configureApp(app);

/* Start HTTP server. */
const server: Server = createServer(app);
server.listen(constants.SERVER_PORT, () => console.log(`Server listening on port ${constants.SERVER_PORT}`));