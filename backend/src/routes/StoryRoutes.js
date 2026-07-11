import express from "express";
import StoryController from "../controllers/StoryController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// Post
router.post("/", upload.single("media"), StoryController.createStory);
router.post("/:id/view", StoryController.viewStory);

// Put

// Delete

// Get
router.get("/", StoryController.getStoryForUser);

export default router;
