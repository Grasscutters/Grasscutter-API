/* Configure 'dotenv'. */
import "dotenv/config";

/* Configure caching system. */
import {refreshCache} from "./cache";
refreshCache().then(() => setInterval(refreshCache, 1000 * 60 * 60));

/* Load configuration. */
require("./config").loadConfig();

/* Configure HTTP. */
import * as constants from "./constants";
import express, {Express} from "express";
import {createServer, Server} from "http";

const app: Express = express();

/* Configure middleware. */
import * as bodyParser from "body-parser";
app.use(bodyParser.json({limit: constants.MAX_BODY_SIZE}));

import {validateAdminEndpoints} from "./middleware/adminValidator";
app.use(validateAdminEndpoints);

/* Import the router. */
require("./routes/router").configureApp(app);

/* Start HTTP server. */
const server: Server = createServer(app);
server.listen(constants.SERVER_PORT, () => console.log(`Server listening on port ${constants.SERVER_PORT}`));