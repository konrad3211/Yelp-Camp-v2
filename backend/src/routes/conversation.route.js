import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import catchAsync from "../lib/catchAsync.js";
import {
  createMessage,
  getConversationMessages,
  getConversations,
  markMessagesAsRead,
  startConversation,
} from "../controllers/conversation.controller.js";
import { isConversationParticipant } from "../middleware/conversation.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createConversationSchema,
  createMessageSchema,
} from "../schemas/conversation.schema.js";

const router = Router();

router.get("/", protect, catchAsync(getConversations));
router.get(
  "/:id/messages",
  protect,
  isConversationParticipant,
  catchAsync(getConversationMessages),
);
router.post(
  "/",
  protect,
  validate(createConversationSchema),
  catchAsync(startConversation),
);
router.post(
  "/:id/messages",
  protect,
  isConversationParticipant,
  validate(createMessageSchema),
  catchAsync(createMessage),
);

router.patch(
  "/:id/messages/read",
  protect,
  isConversationParticipant,
  catchAsync(markMessagesAsRead),
);

export default router;
