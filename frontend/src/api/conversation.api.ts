import { api } from "./axios";
import type {
  CreateConversationResponse,
  getConversationResponse,
} from "../types/conversation";
import type {
  CreateMessageData,
  CreateMessageResponse,
  GetMessagesResponse,
  MarkMessagesAsReadResponse,
} from "../types/message";

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

export const createMessage = async (
  conversationId: string,
  message: CreateMessageData,
) => {
  const response = await api.post<CreateMessageResponse>(
    `/conversations/${conversationId}/messages`,
    message,
  );
  return response.data;
};

export const markMessagesAsRead = async (conversationId: string) => {
  const response = await api.patch<MarkMessagesAsReadResponse>(
    `/conversations/${conversationId}/messages/read`,
  );
  return response.data;
};

export const createConversation = async (campgroundId: string) => {
  const response = await api.post<CreateConversationResponse>(
    "/conversations",
    { campgroundId },
  );

  return response.data;
};

type StartConversationData = {
  text: string;
};

export const startConversation = async (
  campgroundId: string,
  data: StartConversationData,
) => {
  const response = await api.post(
    `/campgrounds/${campgroundId}/conversations`,
    data,
  );
  return response;
};
