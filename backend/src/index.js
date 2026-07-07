import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import campgroundRoutes from "./routes/campground.route.js";
import reviewRoutes from "./routes/review.route.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
app.use("/api/campgrounds", campgroundRoutes);
//review route
app.use("/api/campgrounds/:id/reviews", reviewRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid campground id",
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
