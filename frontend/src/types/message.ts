import type { User } from "./user";
//Nigdzie w messages nie zwracamy email, wiec musimy stworzyc osobny typ dla sendera w message. Pick bierze wartosci z User i przypisuje je MessageSender. Jest to o tyle wygodne, ze jezeli zmienimy jaki kolwiek typ pola User to automatycznie pick odziedziczy te zmiane.
type MessageSender = Pick<User, "_id" | "username" | "imageUrl" | "fullName">;

export type Message = {
  _id: string;
  conversation: string;
  sender: MessageSender;
  text: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetMessagesResponse = {
  success: boolean;
  message: string;
  page: number;
  limit: number;
  hasMore: boolean;
  totalMessages: number;
  messages: Message[];
};

export type CreateMessageData = {
  text: string;
};
export type CreateMessageResponse = {
  success: boolean;
  message: string;
  data: Message;
};

export type MarkMessagesAsReadResponse = {
  success: boolean;
  message: string;
  data: Message[];
};
