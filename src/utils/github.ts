import {GitHubCache} from "./interfaces";

const {GITHUB_REPOS} = require("./constants").default;

const cache: GitHubCache = {commits: {gc_stable: [], gc_dev: [], cultivation: []},
    releases: {gc_stable: "", cultivation: ""}};

/**
 * Starts the refresh task.
 */
let taskId: NodeJS.Timeout;
export function startRefresh(): void {
    refreshCache().then(() => taskId = setInterval(refreshCache, 1000 * (60 * 60)));
}

/**
 * Refreshes the cache.
 */
export async function refreshCache() {
    for(const repo in GITHUB_REPOS.commits) {
        const response: Response = await fetch(GITHUB_REPOS.commits[repo]);
        cache.commits[repo] = await response.json();
    }

    for(const repo in GITHUB_REPOS.releases) {
        const response: Response = await fetch(GITHUB_REPOS.releases[repo]);
        const json: object = await response.json();

        const latestRelease: object = json[0] || {tag_name: "1.0.0"};
        cache.releases[repo] = latestRelease["tag_name"];
    }
}

/**
 * Returns the latest release of the specified repository.
 * @param repo The repository to get the latest release of.
 */
export function latestRelease(repo: string): string {
    return cache.releases[repo] ?? "1.0.0";
}

/* Make the cache accessible. */
export default cache;