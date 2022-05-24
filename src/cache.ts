import {Cache} from "./interfaces";
import fetch, {Response} from "node-fetch";

import {URLS} from "./constants";
import {config} from "./config";
import { getSetting } from "./utils/utils";

/* Initialize empty cache. */
export let cache: Cache = {commits: {gc_stable: [], gc_dev: [], cultivation: []}, version: {gc_stable: "", cultivation: "", game: ""}};

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
    
    cache.version.game = await getSetting("CULTIVATION_GAMEVERSION") as string;
}