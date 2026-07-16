import express from "express";
import MessageController from "../../controllers/admin/MessageController.js";

const router = express.Router();

// GET
router.get("/", MessageController.getConversations);
router.get("/:id/messages", MessageController.getConversationMessages);

// DELETE
router.delete("/conversations/:id", MessageController.deleteConversation);
router.delete("/messages/:id", MessageController.deleteMessage);

// PUT
router.put("/conversations/:id/toggle-active", MessageController.toggleActive);
router.put("/conversations/:id/toggle-delete", MessageController.toggleDelete);

export default router;
