import express from "express";
import StatsController from "../../controllers/admin/StatsController.js";

const router = express.Router();

router.get("/overview", StatsController.getOverviewStats);
router.get("/users", StatsController.getUserStats);
router.get("/posts", StatsController.getPostStats);
router.get("/reports", StatsController.getReportStats);
router.get("/stories", StatsController.getStoryStats);
router.get("/messages", StatsController.getMessageStats);

export default router;
