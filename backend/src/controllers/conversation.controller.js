import { Campground } from "../models/campground.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { AppError } from "../utils/appError.js";

export const createConversation = async (req, res) => {
  const { campgroundId } = req.body;
  const userId = req.user._id;

  const campground = await Campground.findById(campgroundId);

  if (!campground) {
    throw new AppError("Campground not found", 404);
  }

  const ownerId = campground.author;

  if (ownerId.equals(userId)) {
    throw new AppError("You cannot start a conversation with yourself", 400);
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
      success: true,
      message: "Conversation has been created successfully",
      conversation,
    });
  }

  res.status(200).json({
    success: true,
    message: "Conversation already exists",
    conversation,
  });
};

export const createMessage = async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id;

  const conversation = req.conversation;

  const message = await Message.create({
    conversation: conversation._id,
    sender: userId,
    text,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  res.status(201).json({
    success: true,
    message: "Message has been sent successfully",
    data: message,
  });
};

export const getConversations = async (req, res) => {
  const userId = req.user._id;
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "username fullName imageUrl")
    .populate("lastMessage", "text isRead sender createdAt updatedAt")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    message:
      conversations.length === 0
        ? "You do not have any conversations"
        : "Conversations have been fetched successfully",
    conversations,
  });
};

export const getConversationMessages = async (req, res) => {
  const conversation = req.conversation;
  const messages = await Message.find({
    conversation: conversation._id,
  })
    .populate("sender", "username fullName imageUrl")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    message:
      messages.length === 0
        ? "You do not have any messages in this conversation"
        : "Messages have been fetched successfully",
    messages,
  });
};
