import { useEffect, useState } from "react";
import type { Conversation } from "../types/conversation";
import { getConversations } from "../api/conversation.api";
import { Link } from "react-router-dom";

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
