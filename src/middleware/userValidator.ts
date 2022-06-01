import jwt from 'jsonwebtoken';
import * as constants from '../constants';

export default function validateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(403).send({
            success: false,
            error: "MISSING_TOKEN"
        });
    }

    const token = getBearerToken(authHeader);

    if(!token) {
        return res.status(403).send({
            success: false,
            error: "TOKEN_INVALID"
        });
    }

    jwt.verify(token, constants.SIGNING_SECRET, (err, user) => {
        if(err) {
            return res.status(403).send({
                success: false,
                error: "TOKEN_INVALID"
            });
        }

        req.user = user;
        next();
    });
}

export const getBearerToken = (authHeader : string) => {
    if(!authHeader.includes("Bearer ")) {
        return null;
    }
    return authHeader.split(" ")[1];
};