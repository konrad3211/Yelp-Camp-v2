import type { User } from "./user";

export type MessagePreview = {
  _id: string;
  text: string;
  isRead: boolean;
  sender: string;
  createdAt: string;
  updatedAt: string;
};

export type CampgroundPreview = {
  _id: string;
  title: string;
};

export type Conversation = {
  _id: string;
  participants: User[];
  campground: CampgroundPreview;
  lastMessage: MessagePreview | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type getConversationResponse = {
  success: boolean;
  message: string;
  conversations: Conversation[];
};
