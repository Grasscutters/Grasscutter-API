import express from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../database/model/users";
import { registerValidation, loginValidation, verifyTokenValidation } from "../../utils/validation/authValidation";
import Logger from "../../utils/logger";
import { getSetting } from "../../utils/utils";

const router = express.Router();

router.post("/register", async (req, res) => {
	const { error } = registerValidation(req.body);
	if (error) {
		return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
	}

	//Checking if the user is already in the database
	const emailExists = await User.findOne({ email: req.body.email });
    const usernameExists = await User.findOne({ username: req.body.username });

	if (emailExists || usernameExists) {
		return res.send({ success: false, error: "ACCOUNT_EXISTS" });
	}

    if(req.body.password != req.body.password_confirmation) {
        return res.send({ success: false, error: "CONFIRMATION_INVALID" });
    }

	//Hash the password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	//Create a new user
	const user = new User({
		username: req.body.username,
		email: req.body.email,
		password: hashedPassword,
	});

	try {
		const savedUser = await user.save();
        // Send confirmation email

		res.send({ success: true, user: { id: savedUser._id, username: savedUser.username } });
	} catch (err) {
        Logger.error("Unable to save user to database \n" + error);
		return res.send({ success: false, error: "DB_ERROR" });
	}
});

router.post("/login", async (req, res) => {
	const { error } = loginValidation(req.body);
	if (error) {
		return res.send({ success: false, error: "VALIDATION_ERROR", message: error.details[0].message });
	}

	if((await getSetting("REGISTRATION_ENABLED")) == false) {
        return res.send({ success: false, error: "REGISTRATION_DISABLED" });
    }

	var user;
	var data = req.body;

	const usernameExists = await User.findOne({ username: data.username });
	if (usernameExists) {
		user = usernameExists;
	} else {
	    const emailExists = await User.findOne({ email: data.username });

        if(emailExists) {
            user = emailExists;
        } else {
		    return res.send({ success: false, error: "ACCOUNT_INVALID" });
        }   
	}

	if(user.activated === 'not_activated') {
		return res.send({ success: false, error: "ACCOUNT_ACTIVATION_REQUIRED" });
	} else if(user.activated === 'disabled') {
		return res.send({ success: false, error: "ACCOUNT_DISABLED" });
	}

	if(user.permissionLevel === 'system') {
		return res.send({ success: false, error: "ACCOUNT_INVALID" });
	}

	if((await getSetting("MAINTENANCE_MODE")) == true) {
        return res.status(403).send({success: false, error: "MAINTENANCE_MODE"})
    }

	//CHECK IF PASSWORD IS CORRECT
	const validPass = await bcrypt.compare(data.password, user.password);

	if (!validPass) {
		return res.send({ success: false, error: "PASSWORD_INVALID" });
	}

	var token = jwt.sign({ id: user._id, username: user.username, email: user.email, permissionLevel: user.permissionLevel }, process.env.SIGNING_SECRET, { expiresIn: req.body.remember_me ? "31d" : "1h" });
	return res.send({ success: true, token: token, valid_for: req.body.remember_me ? "31d" : "1h" });
});

router.post("/verify", async (req, res) => {
	const { error } = verifyTokenValidation(req.body);
	if (error) {
		return res.send({ success: false, error: error.details[0].message });
	}

	try {
		const verified = jwt.verify(req.body.token, process.env.SIGNING_SECRET);
		return res.send({ success: true, error: "" });
	} catch (err) {
		return res.send({ success: false, error: "Token not valid", error_code: "INVALID_TOKEN" });
	}
});

export default router;
