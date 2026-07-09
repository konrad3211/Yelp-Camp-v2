import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import catchAsync from "../lib/catchAsync.js";
import { createConversation } from "../controllers/conversation.controller.js";

const router = Router();

router.post("/", protect, catchAsync(createConversation));

export default router;
