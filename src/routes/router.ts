import {Express, Request, Response} from "express";
import * as cultivation from "./cultivation";
import * as configuration from "./configuration";
import * as content from "./content";
import * as game from "./game";

export function configureApp(app: Express): void {
    app.get('/', indexEndpoint);

    app.get('/content', content.indexEndpoint);
    app.get('/content/bgfile', content.backgroundEndpoint);

    app.get('/game/download', game.downloadEndpoint);
    app.get('/game/download/:version', game.downloadEndpoint);

    app.get('/cultivation', cultivation.indexEndpoint);
    app.get('/cultivation/query', cultivation.queryEndpoint);
    app.get('/cultivation/download', cultivation.downloadEndpoint);
    app.get('/cultivation/download/:version', cultivation.downloadEndpoint);

    app.post('/configuration/refresh', configuration.refreshEndpoint);
    app.post('/configuration/upload', configuration.uploadEndpoint);
    app.patch('/configuration/update', configuration.updateEndpoint);
    app.patch('/configuration/game', configuration.gameEndpoint);
}

/**
 * @route /
 */

function indexEndpoint(req: Request, res: Response): void {
    res.send("Welcome to the Grasscutter API.");
}