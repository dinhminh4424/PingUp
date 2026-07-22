import express from "express";
import { 
  getAdminConfigs, 
  updateAdminConfigsBatch, 
  getConfigHistory,
  uploadConfigImage
} from "../../controllers/admin/SystemConfigController.js";
import { upload } from "../../middlewares/UpLoadMiddleware.js";

const router = express.Router();

router.get("/", getAdminConfigs);
router.put("/batch", updateAdminConfigsBatch);
router.get("/history", getConfigHistory);
router.post("/upload", upload.single("file"), uploadConfigImage);

export default router;
