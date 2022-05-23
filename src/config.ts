import {CONFIG_FILE} from "./constants";
export let config: Configuration = undefined;

/**
 * Loads the configuration from the file.
 * @return The new configuration data.
 */
export function loadConfig(): Configuration {
    config = require(`${process.cwd()}/${CONFIG_FILE}`); return config;
}

export interface Configuration {
    bgFile: string;
    gameVersion: string;
    machineId: number;
}