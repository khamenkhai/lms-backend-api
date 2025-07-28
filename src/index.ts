import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { AppError } from "./utils/app-error";
import { errorHandler } from "./middlewares/errorHandler";
// import categoryRoutes from "./routes/category.route";
import authRoutes from "./routes/auth.route";
import courseRoutes from "./routes/course.route";
import moduleRoutes from "./routes/module.route";
import orderRoutes from "./routes/order.route";
import contentRoutes from "./routes/content.route";
import enrollmentRoutes from "./routes/enrollment.route";
import quizRoutes from "./routes/quizz.route";
import questionAnswerRoutes from "./routes/quizzAnswer.route";
import cors from 'cors';

// Load environment variables
dotenv.config();

// Create the Express application
const app: Application = express();

app.use(cors({
  origin: '*', // or 'http://localhost:5000'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Define port and app name from environment variables
const PORT: number = parseInt(process.env.PORT || "5000", 10);
const APP_NAME: string = process.env.APP_NAME || "MyApp";

app.use(express.json());

app.use(authRoutes);
app.use(courseRoutes);
app.use(moduleRoutes);
app.use(orderRoutes);
app.use(contentRoutes);
app.use(enrollmentRoutes);
app.use(quizRoutes);
app.use(questionAnswerRoutes);


// Define a basic route with typed req/res
app.get("/", (_req: Request, res: Response): void => {
  res.send(`Welcome to ${APP_NAME}`);
});

// 404 handler
app.use((_req: Request, _res: Response, next) => {
  next(new AppError("Route not found", 404));
});

// Global error handler
app.use(errorHandler);


// Helper function to get local IP address
function getLocalIpAddress(): string {
  const interfaces = require("os").networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "local-ip-address";
}

app.listen(PORT, "192.168.50.21", (): void => {
  console.log(`🚀 ${APP_NAME} is running at http://localhost:${PORT}`);
  console.log(
    `🚀 Also accessible on your local network at http://${getLocalIpAddress()}:${PORT}`
  );
});

// Start the server
// app.listen(PORT, (): void => {
//   console.log(`🚀 ${APP_NAME} is running at http://localhost:${PORT}`);
// });
