import express, {Request, Response} from "express";

import User from "../../database/model/users";
import Logger from "../../utils/logger";
import mailer from "../../utils/mailer";
import MailHelper, {TemplateData} from "../../mail/MailHelper";

import {
    loginValidation,
    registerValidation,
    verifyUserBodyValidation,
    verifyUserQueryValidation
} from "../../utils/validation/authValidation";
import {generateString} from "../../utils/utils";

import * as constants from "../../constants";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import { getSetting } from "../../database/model/settings";

const router = express.Router();

/**
 * Register a new user.
 * @route /user/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
    const {error} = registerValidation(req.body);
    if(error) {
        return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
    }

    if((await getSetting("REGISTRATION_ENABLED")) == false) {
        return res.send({ success: false, error: "REGISTRATION_DISABLED" });
    }

    // Check if the user already exists.
    const emailExists = await User.findOne({ email: req.body.email });
    const usernameExists = await User.findOne({ username: req.body.username });

    if(emailExists || usernameExists) {
        return res.send({ success: false, error: "ACCOUNT_EXISTS" });
    }

    if(req.body.password != req.body.password_confirmation) {
        return res.send({ success: false, error: "CONFIRMATION_INVALID" });
    }

    // Hash the password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Generate a verification code.
    const verificationCode = generateString(6).toLowerCase();

    // Create a new user object.
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        validation: {
            code: verificationCode,
            expiry: moment(Date.now()).add(30, 'm').toDate().getTime(),
        }
    });

    try {
        // Save the user in the database.
        const savedUser = await user.save();
        // Send a confirmation email to the user.
        await sendWelcomeMail(savedUser);

        res.send({ success: true, user: { id: savedUser._id, username: savedUser.username } });
    } catch (err) {
        Logger.error("Unable to save user to database. \n" + err + "\n" + user);
        return res.send({ success: false, error: "DB_ERROR" });
    }
});

/**
 * Login to an account.
 * @route /user/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
    const {error} = loginValidation(req.body);
    if(error) {
        return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
    }

    let user; const data = req.body;

    const usernameExists = await User.findOne({ username: data.username });
    if(usernameExists) {
        user = usernameExists;
    } else {
        const emailExists = await User.findOne({ email: data.username });

        if (emailExists) {
            user = emailExists;
        } else {
            return res.send({ success: false, error: "ACCOUNT_INVALID" });
        }
    }

    if(user.activated === "not_activated") {
        if(user.validation.expiry < Date.now()) {
            user.validation.code = generateString(6).toLowerCase();
            user.validation.expiry = moment(Date.now()).add(30, 'm').toDate().getTime();
            user.save();

            await sendWelcomeMail(user);
            return res.send({ success: false, error: "ACTIVATION_REQUIRED", message: "MAIL_SENT" });
        }

        return res.send({ success: false, error: "ACTIVATION_REQUIRED" });
    } else if (user.activated === "disabled") {
        return res.send({ success: false, error: "ACCOUNT_DISABLED" });
    }

    if(user.permissionLevel === "system") {
        return res.send({ success: false, error: "ACCOUNT_INVALID" });
    }

    if((await getSetting("MAINTENANCE_MODE")) == true && user.permissionLevel == "user") {
        return res.status(403).send({ success: false, error: "MAINTENANCE_MODE" });
    }

    // Check if the password is correct.
    const validPass = await bcrypt.compare(data.password, user.password);

    if(!validPass) {
        return res.send({ success: false, error: "PASSWORD_INVALID" });
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
        permissionLevel: user.permissionLevel
    }, constants.SIGNING_SECRET, {expiresIn: req.body.remember_me ? "31d" : "1h"});
    return res.send({ success: true, token: token, valid_for: req.body.remember_me ? "31d" : "1h" });
});

/**
 * Activate an account using a code sent via email.
 * @route /user/auth/activate
 */
router.all('/activate', async (req: Request, res: Response) => {
    const bodyMode = !!req.body.code;

    let error, data;

    if(bodyMode) {
        error = verifyUserBodyValidation(req.body).error;
        data = req.body;
    } else {
        error = verifyUserQueryValidation(req.query).error;
        try {
            data = await jwt.verify(req.query.code as string, constants.SIGNING_SECRET);
        } catch {
            return res.send({ success: false, error: "VERIFY_ERROR" });
        }
    }

    if(error) {
        return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
    }

    const user = await User.findById(data.id);

    if(user) {
        if(user.activated != "not_activated") {
            return res.send({ success: false, error: "ALREADY_VALID" });
        }

        if(user.validation.code != data.code) {
            return res.send({ success: false, error: "INVALID_CODE" });
        }

        if(user.validation.expiry < Date.now()) {
            user.validation.code = generateString(6).toLowerCase();
            user.validation.expiry = moment(Date.now()).add(30, 'm').toDate().getTime();
            await user.save();

            await sendWelcomeMail(user);

            return res.send({ success: false, error: "EXPIRED_CODE" });
        }

        user.activated = "activated";
        user.validation.code = "";
        user.validation.expiry = 0;
        await user.save();

        return res.send({success: true});
    } else {
        return res.send({success: false, error: "ACCOUNT_INVALID"});
    }
});

export default router;

/**
 * Sends a welcome email to a user.
 * @param savedUser The user to send the email to.
 */
export async function sendWelcomeMail(savedUser) {
    await mailer.sendEmail(savedUser.email, "Welcome to Grasscutters!",
        MailHelper.ReplaceTemplateString(MailHelper.ReadEmailFromTemplate("verifyUser"), [
			<TemplateData>{ templateString: "username", newString: savedUser.username },
			<TemplateData>{ templateString: "code", newString: savedUser.validation.code },
			<TemplateData>{ templateString: "link", newString: process.env["WEBSITE-URL"] + "/user/auth/activate?code=" + jwt.sign({ id: savedUser._id, code: savedUser.validation.code }, constants.SIGNING_SECRET, { expiresIn: "30min" }) }
        ])
    );
}