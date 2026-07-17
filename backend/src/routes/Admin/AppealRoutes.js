import express from "express";
import AppealController from "../../controllers/admin/AppealController.js";

const router = express.Router();

router.get("/", AppealController.getAppeals);
router.put("/:id/resolve", AppealController.resolveAppeal);

export default router;
