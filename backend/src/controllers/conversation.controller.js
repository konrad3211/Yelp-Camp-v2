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

  // Message.create() zwraca dokument Mongoose, dlatego możemy użyć populate().
  // Populate zamienia ObjectId z pola sender na dane użytkownika.
  await message.populate("sender", "username fullName imageUrl");

  const recipientId = conversation.participants.find(
    (participantId) => !participantId.equals(userId),
  );

  if (!recipientId) {
    throw new AppError("Message recipient not found", 500);
  }

  const io = req.app.get("io");

  io.to(`user:${recipientId.toString()}`).emit("newMessage", message);

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
    .populate("campground", "title images")
    .populate("lastMessage", "text isRead sender createdAt updatedAt")
    .sort({ updatedAt: -1 });
  //.lean();

  //liczy liczbe nieodczytanych wiadomosci
  const conversationsWithUnreadCount = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: userId },
        isRead: false,
      });
      //tutaj jest toObject poniewaz jak robimy spread to pokazujemy cala strukture obiektu mongoose, wiec musimy dac toObject aby wynik wygladal schludnie. Robimy spread poniewaz chcemy miec jeden obiekt ktory ma conversation i unreadCount a nie conversation: {} i unreadConut: {}
      //ewentualnie mozna uzyc lean() w zapytaniu conversations
      return {
        ...conversation.toObject(),
        unreadCount,
      };
    }),
  );

  res.status(200).json({
    success: true,
    message:
      conversations.length === 0
        ? "You do not have any conversations"
        : "Conversations have been fetched successfully",
    conversations: conversationsWithUnreadCount,
  });
};

export const getConversationMessages = async (req, res) => {
  const conversation = req.conversation;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
  //ile wiadomości ma pominac
  const skip = (page - 1) * limit;

  //liczy wszystkie wiadomosci tej rozmowy, zwraca tylko liczbe
  const totalMessages = await Message.countDocuments({
    conversation: conversation._id,
  });

  const messages = await Message.find({
    conversation: conversation._id,
  })
    .populate("sender", "username fullName imageUrl")
    .sort({ createdAt: -1 })
    //pomija odpowiednia liczbe wiadomosci, dla 1st page 0, dla 2 30 najnowszych, dla 3 60...
    .skip(skip)
    //pobiera max tyle wiadomosci ile limit
    .limit(limit);

  messages.reverse();

  res.status(200).json({
    success: true,
    message:
      totalMessages === 0
        ? "You do not have any messages in this conversation"
        : messages.length === 0
          ? "No messages found on this page"
          : "Messages have been fetched successfully",

    page,
    limit,
    totalMessages,
    //sprawdza czy sa jeszcze starsze wiadomosci np. 1st 0 + 30 < 50 === true
    hasMore: skip + messages.length < totalMessages,
    messages,
  });
};

export const markMessagesAsRead = async (req, res) => {
  const conversation = req.conversation;
  const userId = req.user._id;
  const recipientId = conversation.participants.find(
    (participantId) => !participantId.equals(userId),
  );

  const filter = {
    conversation: conversation._id,
    sender: { $ne: userId },
    isRead: false,
  };

  //bierzemy dokumenty mongoose
  const messageIds = await Message.distinct("_id", filter);

  await Message.updateMany(
    {
      _id: { $in: messageIds },
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  const updatedMessages = await Message.find({
    _id: { $in: messageIds },
  }).populate("sender", "username fullName imageUrl");

  if (recipientId) {
    const io = req.app.get("io");

    io.to(`user:${recipientId.toString()}`).emit("messagesRead", {
      conversationId: conversation._id.toString(),
      messageIds: updatedMessages.map((message) => message._id.toString()),
    });
  }

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
    data: updatedMessages,
  });
};
