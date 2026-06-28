import express from "express";
import PostController from "../controllers/PostController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

router.post("/create", upload.array("images"), PostController.createPost);

// Get
router.get("/user/:userId", PostController.getPostsByIdUser);
router.get("/", PostController.getPost);

export default router;
