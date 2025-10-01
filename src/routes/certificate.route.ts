import { Router } from "express";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";
import {
  checkCertificateEligibility,
  generateCertificate,
} from "../controllers/certificate.controller";

const certificateRoute = Router();

certificateRoute.post(
  "/certificate-generate",
  authMiddleware,
  generateCertificate
);

certificateRoute.post(
  "/check-eligibility",
  authMiddleware,
  checkCertificateEligibility
);

export default certificateRoute;
