import { Conversation } from "../models/conversation.model.js";

export const isConversationParticipant = async (req, res, next) => {
  const userId = req.user._id;
  const { id: conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.stauts(404).json({ message: "Conversation not found" });
  }

  const isParticipant = conversation.participants.some((participantId) =>
    participantId.equals(userId),
  );

  if (!isParticipant) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access this conversation" });
  }

  req.conversation = conversation;

  next();
};
