import {Request, Response, NextFunction} from "express";
import {ACCESS_DENIED, ALLOWED_IPS} from "../constants";

import {getAddress} from "../utils";

/**
 * Validates if the request is from an admin.
 */
export function validateAdminEndpoints(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    
    // Check if path is to an admin endpoint.
    if(!path.includes("/configuration")) {
        next(); return;
    }
    
    // Check if the accessor is whitelisted.
    if(!ALLOWED_IPS.includes(getAddress(req)))
        return res.status(403).send(ACCESS_DENIED);
    
    next(); // Call next method.
}