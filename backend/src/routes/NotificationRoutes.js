import express from "express";
import NotificationController from "../controllers/NotificationController.js";

const router = express.Router();

router.get("/", NotificationController.getNotifications);
router.put("/read-all", NotificationController.markAllAsRead);
router.put("/:id/read", NotificationController.markAsRead);
router.put("/:id", NotificationController.updateNotification);
router.delete("/:id", NotificationController.deleteNotification);

export default router;
