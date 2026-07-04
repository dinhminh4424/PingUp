import express from "express";
import MessageController from "../controllers/MessageController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

router.get("/:conversationId", MessageController.getMessages);
router.post("/", upload.array("images"), MessageController.sendMessage);

export default router;
