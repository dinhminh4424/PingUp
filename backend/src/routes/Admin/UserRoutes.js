import express from "express";
import UserController from "../../controllers/admin/UesrController.js";

const router = express.Router();

// GET
router.get("/", UserController.getUsers);

export default router;
