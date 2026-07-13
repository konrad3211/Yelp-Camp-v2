export type Message = {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  isRead: string;
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
