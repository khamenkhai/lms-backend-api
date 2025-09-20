import { Router } from "express";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";
import { generateCertificate } from "../controllers/certificate.controller";

const certificateRoute = Router();

certificateRoute.post(
  "/certificate-generate",
  authMiddleware,
  generateCertificate
);

export default certificateRoute;
