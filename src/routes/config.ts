import {Request, Response, Router} from "express";

import constants, {reload} from "../utils/constants";

async function configReload(req: Request, res: Response): Promise<void> {
    // Reload the configurations.
    reload();

    res.status(200).send(constants.OPERATION_SUCCESSFUL());
}

/* Create a router object. */
const router: Router = Router();

/**
 * Reloads the configurations.
 * @route /config/reload
 */
router.patch('/reload', configReload);

/* Return the router. */
export default router;