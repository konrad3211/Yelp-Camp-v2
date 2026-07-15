import { io, type Socket } from "socket.io-client";
import type { Message } from "../types/message";

type MessagesReadPayload = {
  conversationId: string;
  messageIds: string[];
};

type ServerToClientEvents = {
  newMessage: (message: Message) => void;
  messagesRead: (payload: MessagesReadPayload) => void;
};

//tutaj mowimy, ze nie bedziemy emitowac zadnych eventow z klienta
type ClientToServerEvents = Record<string, never>;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_URL,
  {
    autoConnect: false,
  },
);
