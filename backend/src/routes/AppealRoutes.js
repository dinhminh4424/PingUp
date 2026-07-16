import express from "express";
import AppealController from "../controllers/AppealController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

router.post("/", upload.array("media"), AppealController.createAppeal);

export default router;
