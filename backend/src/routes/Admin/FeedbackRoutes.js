import express from "express";
import FeedbackController from "../../controllers/admin/FeedbackController.js";

const router = express.Router();

// GET
router.get("/", FeedbackController.getFeedbacks);

// PUT
router.put("/:id/status", FeedbackController.updateFeedbackStatus);

export default router;
