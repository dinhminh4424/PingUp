import express from "express";
import MessageController from "../controllers/MessageController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

router.get("/link-preview", MessageController.getLinkPreview);
router.get("/:conversationId", MessageController.getMessages);
router.post("/", upload.fields([{ name: "images" }, { name: "files" }]), MessageController.sendMessage);
router.post("/:messageId/react", MessageController.reactToMessage);

export default router;
