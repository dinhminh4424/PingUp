import express from "express";
import UserController from "../../controllers/admin/UserController.js";

const router = express.Router();

// GET
router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserDetail);
router.get("/:id/logs", UserController.getUserLogs);

// PUT
router.put("/:id/toggle-active", UserController.toggleActive);
router.put("/:id/toggle-role", UserController.toggleRole);

export default router;
