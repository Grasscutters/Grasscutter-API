import express from 'express';
import authRoute from './auth';

const router : express.Router = express.Router();

router.use("/auth", authRoute);

export default router;