import express from "express";

import userRoutes from "./UserRoutes.js";
import postRoutes from "./PostRoutes.js";
import messageRoutes from "./MessageRoutes.js";
import statsRoutes from "./StatsRoutes.js";
import reportRoutes from "./ReportRoutes.js";
import feedbackRoutes from "./FeedbackRoutes.js";

import { isAdmin } from "../../middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(isAdmin);

router.use("/user", userRoutes);
router.use("/post", postRoutes);
router.use("/message", messageRoutes);
router.use("/stats", statsRoutes);
router.use("/report", reportRoutes);
router.use("/feedback", feedbackRoutes);

export default router;
