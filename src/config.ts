import {CONFIG_FILE} from "./constants";

import {existsSync, writeFileSync} from "fs";

export let config: Configuration = undefined;

/**
 * Loads the configuration from the file.
 * @return The new configuration data.
 */
export function loadConfig(): Configuration {
    const configFile: string = `${process.cwd()}/${CONFIG_FILE}`;
    if(!existsSync(configFile))
        writeFileSync(configFile, JSON.stringify({}));

    config = require(configFile); return config;
}

export interface Configuration {
    bgFileUrl: string;
    gameVersion: string;
}