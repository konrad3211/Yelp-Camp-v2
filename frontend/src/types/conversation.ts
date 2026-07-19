import type { Message } from "./message";
import type { User } from "./user";

export type CampgroundPreview = {
  _id: string;
  title: string;
};

export type Conversation = {
  _id: string;
  participants: User[];
  campground: CampgroundPreview;
  lastMessage: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type getConversationResponse = {
  success: boolean;
  message: string;
  conversations: Conversation[];
};
