import express from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";

import User from "../../database/model/users";
import { registerValidation, loginValidation, verifyTokenValidation, verifyUserQueryValidation, verifyUserBodyValidation } from "../../utils/validation/authValidation";
import Logger from "../../utils/logger";
import { getSetting, genRandomString } from "../../utils/utils";
import mailer from "../../utils/mailer";
import MailHelper, { TemplateData } from "../../mail/MailHelper";
import * as constants from "../../constants";

const router = express.Router();

/**
 * @route /user/auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
	const { error } = registerValidation(req.body);
	if (error) {
		return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
	}

	if ((await getSetting("REGISTRATION_ENABLED")) == false) {
		return res.send({ success: false, error: "REGISTRATION_DISABLED" });
	}

	//Checking if the user is already in the database
	const emailExists = await User.findOne({ email: req.body.email });
	const usernameExists = await User.findOne({ username: req.body.username });

	if (emailExists || usernameExists) {
		return res.send({ success: false, error: "ACCOUNT_EXISTS" });
	}

	if (req.body.password != req.body.password_confirmation) {
		return res.send({ success: false, error: "CONFIRMATION_INVALID" });
	}

	//Hash the password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	//Generate verification code
	const verificationCode = genRandomString(6).toLowerCase();

	//Create a new user
	const user = new User({
		username: req.body.username,
		email: req.body.email,
		password: hashedPassword,
		validation: {
			code: verificationCode,
			expiry: moment(Date.now()).add(30, 'm').toDate().getTime(),
		},
	});

	try {
		const savedUser = await user.save();
		// Send confirmation email
		await sendWelcomeMail(savedUser);

		res.send({ success: true, user: { id: savedUser._id, username: savedUser.username } });
	} catch (err) {
		Logger.error("Unable to save user to database \n" + err + "\n" + user);
		return res.send({ success: false, error: "DB_ERROR" });
	}
});

/**
 * @route /user/auth/login
 * Login to an account.
 */
router.post("/login", async (req, res) => {
	const { error } = loginValidation(req.body);
	if (error) {
		return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
	}

	var user;
	var data = req.body;

	const usernameExists = await User.findOne({ username: data.username });
	if (usernameExists) {
		user = usernameExists;
	} else {
		const emailExists = await User.findOne({ email: data.username });

		if (emailExists) {
			user = emailExists;
		} else {
			return res.send({ success: false, error: "ACCOUNT_INVALID" });
		}
	}

	if (user.activated === "not_activated") {
		if (user.validation.expiry < Date.now()) {
			const verificationCode = genRandomString(6).toLowerCase();
			user.validation.code = verificationCode;
			user.validation.expiry = moment(Date.now()).add(30, 'm').toDate().getTime();
			user.save();

			await sendWelcomeMail(user);
			return res.send({ success: false, error: "ACTIVATION_REQUIRED", message: "MAIL_SENT" });
		}

		return res.send({ success: false, error: "ACTIVATION_REQUIRED" });
	} else if (user.activated === "disabled") {
		return res.send({ success: false, error: "ACCOUNT_DISABLED" });
	}

	if (user.permissionLevel === "system") {
		return res.send({ success: false, error: "ACCOUNT_INVALID" });
	}

	if ((await getSetting("MAINTENANCE_MODE")) == true && user.permissionLevel == "user") {
		return res.status(403).send({ success: false, error: "MAINTENANCE_MODE" });
	}

	//CHECK IF PASSWORD IS CORRECT
	const validPass = await bcrypt.compare(data.password, user.password);

	if (!validPass) {
		return res.send({ success: false, error: "PASSWORD_INVALID" });
	}

	var token = jwt.sign({ id: user._id, username: user.username, email: user.email, permissionLevel: user.permissionLevel }, constants.SIGNING_SECRET, { expiresIn: req.body.remember_me ? "31d" : "1h" });
	return res.send({ success: true, token: token, valid_for: req.body.remember_me ? "31d" : "1h" });
});

/**
 * @route /user/auth/activate
 * Activate an account using a code sent via email
 */
// Set to all because this can be a post and get request because of the two different modes. Plus I'm lazy lol
router.all("/activate", async (req, res) => {
	const bodyMode = req.body.code ? true : false;

	var error;
	var data;

	if (bodyMode) {
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

	if (error) {
		return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
	}

	const user = await User.findById(data.id);

	if (user) {
		if (user.activated != "not_activated") {
			return res.send({ success: false, error: "ALREADY_VALID" });
		}

		if (user.validation.code != data.code) {
			return res.send({ success: false, error: "INVALID_CODE" });
		}

		if (user.validation.expiry < Date.now()) {
			const verificationCode = genRandomString(6).toLowerCase();
			user.validation.code = verificationCode;
			user.validation.expiry = moment(Date.now()).add(30, 'm').toDate().getTime();
			await user.save();

			await sendWelcomeMail(user);

			return res.send({ success: false, error: "EXPIRED_CODE" });
		}

		user.activated = "activated";
		user.validation.code = "";
		user.validation.expiry = 0;
		await user.save();

		return res.send({ success: true });
	} else {
		return res.send({ success: false, error: "ACCOUNT_INVALID" });
	}
});

// This probably isn't needed because of the middleware. Highly out of date
/*router.post("/verifyToken", async (req, res) => {
	const { error } = verifyTokenValidation(req.body);
	if (error) {
		return res.send({ success: false, error: error.details[0].message });
	}

	try {
		const verified = jwt.verify(req.body.token, constants.SIGNING_SECRET);
		return res.send({ success: true, error: "" });
	} catch (err) {
		return res.send({ success: false, error: "Token not valid", error_code: "INVALID_TOKEN" });
	}
});*/

export async function sendWelcomeMail(savedUser) {
	await mailer.sendEmail(savedUser.email, "Welcome to Grasscutters!", 
		MailHelper.ReplaceTemplateString(MailHelper.ReadEmailFromTemplate("verifyUser"), [
			<TemplateData>{ templateString: "username", newString: savedUser.username }, 
			<TemplateData>{ templateString: "code", newString: savedUser.validation.code }, 
			<TemplateData>{ templateString: "link", newString: process.env["WEBSITE-URL"] + "/user/auth/activate?code=" + jwt.sign({ id: savedUser._id, code: savedUser.validation.code }, constants.SIGNING_SECRET, { expiresIn: "30min" }) }
		])
	);
}

export default router;
