import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Import routes & middlewares
import { AppError } from "./utils/app-error";
import { errorHandler } from "./middlewares/error-handler";
import authRoutes from "./routes/auth.route";
import courseRoutes from "./routes/course.route";
import moduleRoutes from "./routes/module.route";
import contentRoutes from "./routes/content.route";
import enrollmentRoutes from "./routes/enrollment.route";
import quizRoutes from "./routes/quizz.route";
import questionAnswerRoutes from "./routes/quizzAnswer.route";
import categoryRoutes from "./routes/category.route";
import progressRoutes from "./routes/progress.route";
import quizzAttempRoutes from "./routes/quizz-attemp.route";
import certificateRoute from "./routes/certificate.route";
import usersRoute from "./routes/user.route";
import tagRoute from "./routes/tag.route";

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Define port and app name
const PORT: number = parseInt(process.env.PORT || "5000", 10);
const APP_NAME: string = "LMS_CC";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve public folder
app.use("/public", express.static(path.join(__dirname, "../public")));

// CORS for Flutter Web or other clients
app.use(
  cors({
    origin: "*", // replace with your frontend URL if needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use(authRoutes);
app.use(courseRoutes);
app.use(moduleRoutes);
app.use(categoryRoutes);
app.use(contentRoutes);
app.use(enrollmentRoutes);
app.use(quizRoutes);
app.use(questionAnswerRoutes);
app.use(progressRoutes);
app.use(quizzAttempRoutes);
app.use(certificateRoute);
app.use(usersRoute);
app.use(tagRoute);

// Basic root route
app.get("/", (_req: Request, res: Response) => {
  res.send(`Welcome to ${APP_NAME}`);
});

// Test API route
app.get("/test", (_req: Request, res: Response) => {
  res.json({ message: "API is working!" });
});

// 404 handler
app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404));
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} is running on port ${PORT}`);
});
