import express from "express";
import ConversationController from "../controllers/ConversationController.js";

const router = express.Router();

// Routes
router.post("/createConversation", ConversationController.createConversation);

export default router;
