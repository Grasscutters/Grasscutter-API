import constants from "./constants";

/* Called when the HTTP server binds. */
export function startServer() {
    console.log("Server started on port " + constants.SERVER_PORT);
}