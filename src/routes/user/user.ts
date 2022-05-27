import express from "express";
import { GetUserByID } from "../../database/model/users";
import validateToken from "../../middleware/userValidator";
import authRoute from "./auth";

const router: express.Router = express.Router();

router.use("/auth", authRoute);

router.get("/@me", validateToken, async (req, res) => {
	const user = await GetUserByID((req as any).user.id);

	const you = {
		id: user._id,
		username: user.username,
		email: user.email,
		activated: user.activated,
		perissionLevel: user.permissionLevel,
		settings: user.settings,
		dateCreated: user.dateCreated,
	};

	return res.send({ success: true, user: you });
});

router.get("/:id", async (req, res) => {
	const user = await GetUserByID(req.params.id);

    if (!user) {
        return res.status(404).send({ success: false, error: "USER_NOT_FOUND" });
    }

    const public_user = {
        id: user._id,
        username: user.username,
        activated: user.activated,
        perissionLevel: user.permissionLevel,
        dateCreated: user.dateCreated,
    };

    return res.send({ success: true, user: public_user });
});

router.get("/:id/plugins", async (req, res) => {
	const user = await GetUserByID(req.params.id);

    return res.send({ success: false, error: "TODO" });
});

export default router;
