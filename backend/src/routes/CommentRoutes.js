import express from "express";
import CommentController from "../controllers/CommentController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

router.post("/:id/report", upload.array("images"), CommentController.createReportComment);
router.post("/", upload.single("image"), CommentController.createComment);

router.get("/post/:postId", CommentController.getCommentsByPost);

router.put("/:id/toggleLike", CommentController.toggleLikeComment);

router.delete("/:id", CommentController.deleteComment);

export default router;
