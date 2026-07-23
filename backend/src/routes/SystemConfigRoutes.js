import express from "express";
import { getPublicConfigs } from "../controllers/SystemConfigController.js";

const router = express.Router();

router.get("/public", getPublicConfigs);

export default router;
