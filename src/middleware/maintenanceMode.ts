import {Request, Response, NextFunction} from "express";
import { getSetting } from "../database/model/settings";

export async function checkMaintenanceMode(req: Request, res: Response, next: NextFunction) {
    const path = req.path;

    // Check if admins are trying to access server. also allow logging in but handle non admins in the login
    if(path.includes("/admin") || path.includes("/user/auth/login")) {
        next(); return;
    }

    // Check if path is to an admin endpoint.
    if((await getSetting("MAINTENANCE_MODE")) == true) {
        return res.status(403).send({message: "Server in maintenance mode..."});
    }

    next(); // Call next method.
}