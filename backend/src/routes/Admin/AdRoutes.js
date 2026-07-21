import express from "express";
import AdController from "../../controllers/admin/AdController.js";

const router = express.Router();

// GET
router.get("/campaigns", AdController.getAdminCampaigns);

// PUT (Phê duyệt/Từ chối)
router.put("/campaigns/:id/review", AdController.reviewCampaign);

// DELETE
router.delete("/campaigns/:id", AdController.deleteCampaign);

// GET Leads
router.get("/leads", AdController.getAdminLeads);

export default router;
