import { Router } from "express";
import {
  login,
  getProfile,
  sendRegistrationOTP,
  verifyOTPAndRegister,
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
} from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth-middleware";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/register/send-otp", sendRegistrationOTP);
authRoutes.post("/register/verify-otp", verifyOTPAndRegister);
authRoutes.get("/profile", authMiddleware, getProfile);
authRoutes.post("/forgot-password", sendForgotPasswordOTP);
authRoutes.post("/reset-password", resetPasswordWithOTP);

export default authRoutes;
