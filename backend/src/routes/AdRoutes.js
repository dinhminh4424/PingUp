import express from "express";
import AdController from "../controllers/AdController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// Lấy quảng cáo để hiển thị (serve) & tracking
router.get("/serve", AdController.serveAds);
router.post("/track", AdController.trackEvent);

// API cho nhà quảng cáo
router.post("/campaigns", upload.single("image"), AdController.createCampaign);
router.get("/campaigns", AdController.getCampaigns);
router.put("/campaigns/:id/status", AdController.toggleCampaignStatus);
router.put("/campaigns/:id", upload.single("image"), AdController.updateCampaign);
router.delete("/campaigns/:id", AdController.deleteCampaign);
router.post("/campaigns/:id/lead", AdController.submitLead);
router.get("/leads", AdController.getLeads);
router.delete("/leads/:id", AdController.deleteLead);

export default router;
