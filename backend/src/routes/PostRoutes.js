import express from "express";
import PostController from "../controllers/PostController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// Post
router.post("/create", upload.array("images"), PostController.createPost);
router.post("/sharePost", PostController.sharePost);

// Put
router.put("/:id/toggleLike", PostController.toggleLike);
router.put("/:id", upload.array("image_urls_new"), PostController.updatePost);

// Delete
router.delete("/:id", PostController.deletePost);

// Get
router.get("/user/:userId/liked", PostController.getLikedPosts);
router.get("/user/:userId", PostController.getPostsByIdUser);
router.get("/:id", PostController.getPostById);
router.get("/", PostController.getPost);

export default router;
