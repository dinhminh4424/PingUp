import express from "express";
import UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/UpLoadMiddleware.js";

const router = express.Router();

// GET
router.get("/me", UserController.authMe);
router.get("/search", UserController.findUserBySearch);
router.get("/:id", UserController.getUserById);

// PUT
router.put(
  "/",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  UserController.updateInfoUser,
);

// POST
router.post(
  "/:id/report",
  upload.array("images"),
  UserController.createReportUser,
);

export default router;
