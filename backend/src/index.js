import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import campgroundRoutes from "./routes/campground.route.js";
import reviewRoutes from "./routes/review.route.js";
import authRoutes from "./routes/auth.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import multer from "multer";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
app.use("/api/campgrounds", campgroundRoutes);
//review route
app.use("/api/campgrounds/:id/reviews", reviewRoutes);
app.use("/api/conversations", conversationRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File is too large. Maximum file size is 5 MB.",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. You can upload a maximum of 5 files.",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field or too many uploaded files",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource id",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
