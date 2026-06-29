import express from "express";
import authRoutes from "./AuthRoutes.js";
import userRoutes from "./UserRoutes.js";
import postRoutes from "./PostRoutes.js";
import connectionRoutes from "./ConnectionRoutes.js";
import followRoutes from "./FollowRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/posts", postRoutes);

router.use("/connection", connectionRoutes);

router.use("/follow", followRoutes);

export default router;
