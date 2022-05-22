export const SERVER_PORT = process.env["HTTP-PORT"] || 6896;
export const CONFIG_FILE = process.env["CONFIG-FILE"] || "config.json";
export const ALLOWED_IPS = (() => {
    const ips = process.env["ALLOWED-IPS"];
    return ips ? ips.split(",") : [];
})();

export const DEFAULT_RESPONSE = {retcode: 0, code: 0};
export const ACCESS_DENIED = {retcode: 1, code: 1, msg: "Access denied."};