import {Cache, GameData} from "./interfaces";
import {Response} from "node-fetch";
import {URLS} from "./constants";

import {config} from "./config";

import {existsSync, writeFileSync} from "fs";
import fetch from "node-fetch";

/* Initialize empty cache. */
export let cache: Cache = {commits: {gc_stable: [], gc_dev: [], cultivation: []}, version: {gc_stable: "", cultivation: "", game: ""}};
/* Initialize empty game data cache. */
export let gameDataCache: GameData = {download_url: "", version: ""};

/**
 * Refreshes the game data cache.
 */
export function refreshGameCache() {
    const cacheFile: string = `${process.cwd()}/game-data.json`;
    if(!existsSync(cacheFile))
        writeFileSync(cacheFile, JSON.stringify({}));

    gameDataCache = require(cacheFile);
}

/**
 * Refreshes the cache.
 */
export async function refreshCache() {
    for(const repo in URLS.commits) {
        const response: Response = await fetch(URLS.commits[repo]);
        cache.commits[repo] = await response.json();
    }

    for(const repo in URLS.releases) {
        const response: Response = await fetch(URLS.releases[repo]);
        const json: object = await response.json();

        const latestRelease: object = json[0] || {tag_name: "6.9.42"};
        cache.version[repo] = latestRelease["tag_name"];
    }

    cache.version.game = config.gameVersion || "2.6";
}