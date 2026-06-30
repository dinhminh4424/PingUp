import express from "express";
import ConversationController from "../controllers/ConversationController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// Routes

// POST
router.post("/", upload.single("imageGroup"), ConversationController.createConversation);

// GET
router.get("/", ConversationController.getConversation);

export default router;
