import express from "express";
import ReportController from "../../controllers/admin/ReportController.js";

const router = express.Router();

// GET
router.get("/posts", ReportController.getReportPost);
router.get("/comments", ReportController.getReportComment);

// PUT
router.put("/:id/status", ReportController.updateReportStatus);

export default router;
