import {Express, Request, Response} from "express";
import cultivation from "./cultivation";
import plugins from "./plugins";
import user from "./user/user";

export function configureApp(app: Express): void {
    app.get('/', indexEndpoint);

    app.use('/cultivation', cultivation);
    app.use('/plugins', plugins);
    app.use('/user', user);

    /*app.post('/configuration/refresh', configuration.refreshEndpoint);
    app.patch('/configuration/update', configuration.updateEndpoint);*/
}

/**
 * @route /
 */

function indexEndpoint(req: Request, res: Response): void {
    res.send("Welcome to the Grasscutter API.");
}