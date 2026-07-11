import { Conversation } from "../models/conversation.model.js";
import { AppError } from "../utils/appError.js";

export const isConversationParticipant = async (req, res, next) => {
  const userId = req.user._id;
  const { id: conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  const isParticipant = conversation.participants.some((participantId) =>
    participantId.equals(userId),
  );

  if (!isParticipant) {
    throw new AppError("You are not allowed to access this conversation", 403);
  }

  req.conversation = conversation;
  next();
};
