import { Campground } from "../models/campground.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

export const createConversation = async (req, res) => {
  const { campgroundId } = req.body;
  const userId = req.user._id;

  const campground = await Campground.findById(campgroundId);

  if (!campground) {
    return res.status(404).json({
      message: "Campground not found",
    });
  }

  const ownerId = campground.author;

  if (ownerId.equals(userId)) {
    return res
      .status(400)
      .json({ message: "You cannot start a conversation with yourself" });
  }

  let conversation = await Conversation.findOne({
    campground: campgroundId,
    participants: {
      $all: [userId, ownerId],
    },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      campground: campgroundId,
      participants: [userId, ownerId],
    });

    return res.status(201).json({
      message: "Conversation has been created successfully",
      conversation,
    });
  }

  res.status(200).json({
    message: "Conversation already exists",
    conversation,
  });
};

export const createMessage = async (req, res) => {
  const { id: conversationId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const isParticipant = conversation.participants.some((participantId) =>
    participantId.equals(userId),
  );

  if (!isParticipant) {
    return res.status(403).json({
      message: "You are not allowed to send messages in this conversation",
    });
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    text,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  res.status(201).json({
    message: "Message has been sent successfully",
    data: message,
  });
};
