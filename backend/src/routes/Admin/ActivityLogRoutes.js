import express from "express";
import ActivityLogController from "../../controllers/admin/ActivityLogController.js";

const router = express.Router();

router.get("/", ActivityLogController.getAllLogs);
router.get("/stats", ActivityLogController.getLogStats);
router.get("/alerts", ActivityLogController.getSuspiciousActivities);

export default router;
