import express from "express";

import userRoutes from "./UserRoutes.js";
import statsRoutes from "./StatsRoutes.js";
import { isAdmin } from "../../middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(isAdmin);

router.use("/user", userRoutes);
router.use("/stats", statsRoutes);

export default router;
