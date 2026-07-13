import { api } from "./axios";
import type { getConversationResponse } from "../types/conversation";
import type { GetMessagesResponse } from "../types/message";

export const getConversations = async () => {
  const response = await api.get<getConversationResponse>("/conversations");
  return response.data;
};

export const getConversationMessages = async (
  conversationId: string,
  page = 1,
  limit = 30,
) => {
  const response = await api.get<GetMessagesResponse>(
    `/conversations/${conversationId}/messages`,
    {
      params: {
        page,
        limit,
      },
    },
  );
  return response.data;
};
