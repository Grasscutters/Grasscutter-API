export interface CultivationQuery {
    bg_file: string;
    commits: string; // Base64-encoded CommitData.
    version: VersionData;
}

export interface Cache {
    commits: CommitData;
    version: VersionData;
}

/* Data holders. */

export interface VersionData {
    gc_stable: string;
    cultivation: string;
    game: string;
}

export interface CommitData {
    gc_stable: object[];
    gc_dev: object[];
    cultivation: object[];
}