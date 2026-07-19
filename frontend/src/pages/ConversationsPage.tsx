import { useEffect, useState } from "react";
import type { Conversation } from "../types/conversation";
import { getConversations } from "../api/conversation.api";
import { Link } from "react-router-dom";
import type { Message } from "../types/message";
import { socket } from "../lib/socket";

const ConversationsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data.conversations);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        setError("Failed to fetch conversations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleNewMessage = (newMessage: Message) => {
      setConversations((prevConversations) =>
        prevConversations
          .map((conversation) =>
            conversation._id === newMessage.conversation
              ? {
                  ...conversation,
                  lastMessage: newMessage,
                  unreadCount: (conversation.unreadCount ?? 0) + 1,
                  updatedAt: newMessage.createdAt,
                }
              : conversation,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []);

  if (isLoading) return <p>Loading conversations...</p>;

  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1>Conversations</h1>
      {conversations.length === 0 ? (
        <p>You do not have any conversations yet.</p>
      ) : (
        conversations.map((conversation) => (
          <article key={conversation._id}>
            <Link to={`/conversations/${conversation._id}`}>
              <h2>{conversation.campground.title}</h2>
              <p>{conversation.lastMessage?.text ?? "No messages yet"}</p>
              {conversation.unreadCount !== undefined && (
                <p>Unread: {conversation.unreadCount}</p>
              )}
            </Link>
          </article>
        ))
      )}
    </main>
  );
};

export default ConversationsPage;
