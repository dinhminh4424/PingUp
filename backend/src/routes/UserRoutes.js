import express from "express";
import UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

router.get("/me", UserController.authMe);
router.get("/:id", UserController.getUserById);

router.put(
  "/",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  UserController.updateInfoUser,
);

export default router;
