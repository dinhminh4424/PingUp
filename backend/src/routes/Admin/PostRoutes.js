import express from "express";
import PostController from "../../controllers/admin/PostController.js";

const router = express.Router();

// GET
router.get("/", PostController.getPosts);
router.get("/reports", PostController.getReportPost);

// PUT
router.put("/:id/toggle-active", PostController.toggleActive);
router.put("/:id/toggle-delete", PostController.toggleDelete);
router.put("/:id/toggle-comment-disabled", PostController.toggleCommentDisabled);

export default router;
