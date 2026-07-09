import express from "express";
import authRoutes from "./AuthRoutes.js";
import userRoutes from "./UserRoutes.js";
import postRoutes from "./PostRoutes.js";
import connectionRoutes from "./ConnectionRoutes.js";
import followRoutes from "./FollowRoutes.js";
import conversationRoutes from "./ConversationRoutes.js";
import notificationRoutes from "./NotificationRoutes.js";
import commentRoutes from "./CommentRoutes.js";
import messageRoutes from "./MessageRoutes.js";
import storyRoutes from "./StoryRoutes.js";
import adminRoutes from "./Admin/index.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/posts", postRoutes);

router.use("/connection", connectionRoutes);

router.use("/follow", followRoutes);

router.use("/conversation", conversationRoutes);

router.use("/notifications", notificationRoutes);

router.use("/comments", commentRoutes);

router.use("/message", messageRoutes);

router.use("/story", storyRoutes);

router.use("/admin", adminRoutes);

export default router;
