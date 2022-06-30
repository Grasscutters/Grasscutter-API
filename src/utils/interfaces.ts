/* JSON file schemas. */
export interface GameVersions {
    latest: string;
    versions: { [key: string]: GameVersion }[];
    patches: { [key: string]: GameVersion }[];
}

export interface Cultivation {
    defaultBg: string; // A URL to the official launcher's background.
}

/* Object schemas. */
export interface Update {
    url?: string; // The URL of the update download.
    signature?: string; // The signature of the update.
    version: string; // The version of the update.
    file: string; // The file name of the update.
}

export interface GameVersion extends Update {
    // download: string; // The download URL for the game.
    // md5: string; // The MD5 hash of the game.
    tag: string; // The shortened version number.
    // version: string; // The version displayed in-game.
    size: BigInt; // The size of the game in bytes.
}

export interface CultivationUpdate extends Update {
    // url: string; // The URL of the update download.
    // version: string; // The version of the update.
    notes: string; // Release notes with the new update.
    pub_date: string; // The date of when the update was released.
    // signature?: string; // The signature of the update executable.
}

export interface Repositories {
    gc_stable: object[]|string;
    gc_dev?: object[]|string;
    cultivation: object[]|string;
}

export interface GitHubCache {
    commits: Repositories;
    releases: Repositories;
}