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
router.put(
  "/:conversationId/read",
  ConversationController.markAsRead,
);

// POST Actions
router.post(
  "/:conversationId/leave",
  ConversationController.leaveConversation,
);
router.post(
  "/:conversationId/report",
  upload.array("images"),
  ConversationController.reportConversation,
);
router.post(
  "/:conversationId/join-request",
  ConversationController.requestToJoin,
);
router.post(
  "/:conversationId/approve-request",
  ConversationController.approveJoinRequest,
);
router.post(
  "/:conversationId/reject-request",
  ConversationController.rejectJoinRequest,
);
router.post(
  "/:conversationId/disband",
  ConversationController.disbandGroup,
);

// GET
router.get("/search-groups", ConversationController.searchGroups);
router.get("/:conversationId", ConversationController.getConversationById);
router.get("/", ConversationController.getConversation);

export default router;
