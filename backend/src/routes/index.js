import express from "express";
import authRoutes from "./AuthRoutes.js";
import userRoutes from "./UserRoutes.js";
import postRoutes from "./PostRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/posts", postRoutes);

export default router;
