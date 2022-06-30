import {Cultivation, GameVersions} from "./interfaces";

import {writeFileSync} from "fs";

const COMMITS_OF = (user: string, repo: string, branch?: string) => {
    let url: string = `https://api.github.com/repos/${user}/${repo}/commits`;
    branch && (url += `?sha=${branch}`); return url;
};
const RELEASES_OF = (user: string, repo: string) => `https://api.github.com/repos/${user}/${repo}/releases`;

export default {
    /* Environment variables. */
    SERVER_PORT: process.env["HTTP-PORT"] || 6896,
    MAX_BODY_SIZE: process.env["MAX-BODY-SIZE"] || "50mb",

    /* Paths. */
    GAME_VERSION_DATA: process.env["GAME-VERSION-DATA"] || "game-data.json",
    CULTIVATION_DATA: process.env["CULTIVATION-DATA"] || "cultivation-data.json",
    CONTENT_DIRECTORY: process.env["DOWNLOAD-DIRECTORY"] || `${process.cwd()}/content`,
    UPDATES_DIRECTORY: process.env["UPDATES-DIRECTORY"] || `${process.cwd()}/updates`,

    /* Dynamic environment variables. */
    ALLOWED_ADDRESSES: (() => {
        const ips = process.env["ALLOWED-IPS"];
        return ips ? ips.split(",") : [];
    })(),

    /* HTTP responses. */
    ACCESS_DENIED: (() => {
        return {status: 403, time: Date.now(), msg: "You do not have permission to view this."};
    }),
    NO_UPDATE: (() => {
        return {status: 204, time: Date.now(), msg: "Update is not available.", reason: "You are on the latest version."};
    }),
    FILE_DOES_NOT_EXIST: (() => {
        return {status: 404, time: Date.now(), msg: "File not found."};
    }),
    OPERATION_SUCCESSFUL: (() => {
        return {status: 200, time: Date.now(), msg: "Operation successful."};
    }),

    /* HTTP endpoints. */
    GITHUB_REPOS: {
        commits: {
            gc_stable: COMMITS_OF("Grasscutters", "Grasscutter"),
            gc_dev: COMMITS_OF("Grasscutters", "Grasscutter", "development"),
            cultivation: COMMITS_OF("Grasscutters", "Cultivation")
        },
        releases: {
            gc_stable: RELEASES_OF("Grasscutters", "Grasscutter"),
            cultivation: RELEASES_OF("Grasscutters", "Cultivation")
        }
    }
};

/* JSON file data storage. */
export let gameVersionData: GameVersions, cultivationData: Cultivation;

/**
 * Reloads the JSON properties from file.
 */
export function reload() {
    const constants = require("./constants").default;
    gameVersionData = require(`${process.cwd()}/${constants.GAME_VERSION_DATA}`);
    cultivationData = require(`${process.cwd()}/${constants.CULTIVATION_DATA}`);
}

/**
 * Writes new data to a JSON file.
 */
export function write(newData: object, file: string) {
    writeFileSync(`${process.cwd()}/${file}`, JSON.stringify(newData, null, 2));
}