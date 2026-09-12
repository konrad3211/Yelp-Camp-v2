import http from "http";
import dotenv from "dotenv";

import app from "./app.js";
import { initializeSocket } from "./lib/socket.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

const io = initializeSocket(httpServer);

app.set("io", io);

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
