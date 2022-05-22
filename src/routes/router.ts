import {Express, Request, Response} from "express";
import * as cultivation from "./cultivation";
import * as configuration from "./configuration";

export function configureApp(app: Express): void {
    app.get('/', indexEndpoint);
    
    app.get('/cultivation', cultivation.indexEndpoint);
    app.get('/cultivation/query', cultivation.queryEndpoint);
    
    app.post('/configuration/refresh', configuration.refreshEndpoint);
    app.patch('/configuration/update', configuration.updateEndpoint);
}

/**
 * @route /
 */
function indexEndpoint(req: Request, res: Response): void {
    res.send("Welcome to the Grasscutter API.");
}