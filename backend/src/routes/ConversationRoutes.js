import express from "express";
import ConversationController from "../controllers/ConversationController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// Routes

// POST
router.post(
  "/",
  upload.single("imageGroup"),
  ConversationController.createConversation,
);

// PUT
router.put(
  "/:conversationId",
  upload.single("imageGroup"),
  ConversationController.updateConversation,
);
router.put(
  "/:conversationId/customization",
  ConversationController.updateCustomization,
);

// GET
router.get("/:conversationId", ConversationController.getConversationById);
router.get("/", ConversationController.getConversation);

export default router;
