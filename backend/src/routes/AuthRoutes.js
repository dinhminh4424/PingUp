import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.logIn);
router.post("/logout", AuthController.logOut);
router.post("/refresh-token", AuthController.refreshToken);

router.get("/test", AuthController.test);

export default router;
