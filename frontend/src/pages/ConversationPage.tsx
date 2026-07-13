import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useState } from "react";
import { getConversationMessages } from "../api/conversation.api";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();

  const currentUser = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) {
        setError("Conversation id is missing");
        setIsLoading(false);
        return;
      }
      try {
        setError("");
        const data = await getConversationMessages(id);
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setError("Failed to fetch messages");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (isLoading) return <p>Loading messages...</p>;
  if (error) return <p>{error}</p>;
  return (
    <main>
      <Link to="/conversations">Back to conversations</Link>
      <h1>Conversations</h1>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((message) => {
          //jezeli id sendera jest takie samo jak moje to to jest moja wiadomosc
          const isOwnMessage = message.sender._id === currentUser?._id;
          return (
            <article key={message._id}>
              <strong>{isOwnMessage ? "You" : message.sender.username}</strong>
              <p>{message.text}</p>
              <small>{new Date(message.createdAt).toLocaleString()}</small>
            </article>
          );
        })
      )}
    </main>
  );
};

export default ConversationPage;
