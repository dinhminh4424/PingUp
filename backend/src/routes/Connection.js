import express from "express";
import ConnectionController from "../controllers/ConnectionController.js";

const router = express.Router();

// Routes
router.post("/sendConnectionRequest", ConnectionController.sendConnectionRequest);
router.get("/status/:profileId", ConnectionController.getConnectionStatus);
router.post("/accept", ConnectionController.acceptConnectionRequest);
router.post("/reject", ConnectionController.rejectConnectionRequest);
router.post("/disconnect", ConnectionController.disconnectConnection);
router.post("/follow", ConnectionController.toggleFollow);

export default router;
