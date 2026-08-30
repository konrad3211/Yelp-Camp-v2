import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import catchAsync from "../lib/catchAsync.js";
import {
  createMessage,
  getConversationMessages,
  getConversations,
  isThereConvesration,
  markMessagesAsRead,
  startConversation,
  startConvesartionWithGuest,
} from "../controllers/conversation.controller.js";
import { isConversationParticipant } from "../middleware/conversation.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createMessageSchema } from "../schemas/conversation.schema.js";

const router = Router();

router.get("/", protect, catchAsync(getConversations));
router.get(
  "/:campgroundId/:guestId/check",
  protect,
  catchAsync(isThereConvesration),
);

router.get(
  "/:id/messages",
  protect,
  isConversationParticipant,
  catchAsync(getConversationMessages),
);
router.post(
  "/start/:campgroundId",
  protect,
  validate(createMessageSchema),
  catchAsync(startConversation),
);

router.post(
  "/start/:campgroundId/:guestId",
  protect,
  validate(createMessageSchema),
  catchAsync(startConvesartionWithGuest),
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
