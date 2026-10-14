import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import userRouter from "./routes/user.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import ApiError from "./utils/ApiError.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://skillbridgeai-s.vercel.app"],
    credentials: true,
  }),
);

// Health check root endpoint for Render & Uptime Monitors
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillBridge AI API Server is live",
  });
});

// Mount API routers
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/user", userRouter);

// Fallback for 404 - Route Not Found
app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling middleware
app.use(errorMiddleware);

export default app;