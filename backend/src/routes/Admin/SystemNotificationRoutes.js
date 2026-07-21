import express from "express";
import SystemNotificationController from "../../controllers/admin/SystemNotificationController.js";
import { upload } from "../../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// Templates
router.get("/templates", SystemNotificationController.getTemplates);
router.post("/templates", SystemNotificationController.createTemplate);
router.put("/templates/:id", SystemNotificationController.updateTemplate);
router.delete("/templates/:id", SystemNotificationController.deleteTemplate);

// Upload Image
router.post("/upload-image", upload.single("image"), SystemNotificationController.uploadModalImage);

// Broadcasts / Sending
router.post("/broadcast", SystemNotificationController.sendBroadcast);
router.get("/history", SystemNotificationController.getBroadcastHistory);
router.delete("/history/:id", SystemNotificationController.revokeBroadcast);

export default router;
