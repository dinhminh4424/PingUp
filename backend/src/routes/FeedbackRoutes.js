import express from "express";
import FeedbackController from "../controllers/FeedbackController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// POST
router.post(
  "/create",
  upload.array("media"),
  FeedbackController.createFeedback,
);

export default router;
