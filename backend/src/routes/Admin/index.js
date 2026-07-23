import express from "express";

import userRoutes from "./UserRoutes.js";
import postRoutes from "./PostRoutes.js";
import messageRoutes from "./MessageRoutes.js";
import statsRoutes from "./StatsRoutes.js";
import reportRoutes from "./ReportRoutes.js";
import feedbackRoutes from "./FeedbackRoutes.js";
import appealRoutes from "./AppealRoutes.js";
import commentRoutes from "./CommentRoutes.js";
import systemNotificationRoutes from "./SystemNotificationRoutes.js";
import adRoutes from "./AdRoutes.js";
import activityLogRoutes from "./ActivityLogRoutes.js";
import systemConfigRoutes from "./SystemConfigRoutes.js";


import { isAdmin } from "../../middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(isAdmin);

router.use("/user", userRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentRoutes);
router.use("/message", messageRoutes);
router.use("/stats", statsRoutes);
router.use("/report", reportRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/appeal", appealRoutes);
router.use("/notifications", systemNotificationRoutes);
router.use("/ads", adRoutes);
router.use("/logs", activityLogRoutes);
router.use("/config", systemConfigRoutes);


export default router;
