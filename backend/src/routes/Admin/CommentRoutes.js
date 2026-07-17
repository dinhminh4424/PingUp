import express from "express";
import CommentController from "../../controllers/admin/CommentController.js";

const router = express.Router();

// PUT
router.put("/:id/toggle-active", CommentController.toggleActive);
router.put("/:id/toggle-delete", CommentController.toggleDelete);

export default router;
