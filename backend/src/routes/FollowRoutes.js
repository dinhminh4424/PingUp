import express from "express";
import FollowController from "../controllers/FollowController.js";

const router = express.Router();

// Routes

router.get("/follower", FollowController.getFollower);
router.get("/following", FollowController.getFollowing);

export default router;
