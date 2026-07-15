import express from "express";
import FeedbackController from "../../controllers/admin/FeedbackController.js";

const router = express.Router();

// GET
router.get("/", FeedbackController.getFeedbacks);

export default router;
