import express from "express";

import { handleLogin,  handleLogout, handleVerifyToken, handleForgotPassword } from "../controller/auth-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.post("/login", handleLogin);

router.post("/logout",  handleLogout);

router.get("/verify-token", verifyAccessToken, handleVerifyToken);

router.post("/forgot-password", handleForgotPassword);

export default router;
