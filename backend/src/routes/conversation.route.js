import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import catchAsync from "../lib/catchAsync.js";
import {
  createConversation,
  createMessage,
} from "../controllers/conversation.controller.js";

const router = Router();

router.post("/", protect, catchAsync(createConversation));
router.post("/:id/messages", protect, catchAsync(createMessage));

export default router;
