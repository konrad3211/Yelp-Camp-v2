import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useState, type SubmitEventHandler } from "react";
import {
  createMessage,
  getConversationMessages,
} from "../api/conversation.api";
import type { Message } from "../types/message";
import { socket } from "../lib/socket";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();

  const currentUser = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
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

  useEffect(() => {
    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.conversation !== id) {
        return;
      }

      setMessages((currentMessages) => [...currentMessages, newMessage]);
    };
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [id]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!id || !trimmedText) return;
    try {
      setIsSending(true);
      const msg = await createMessage(id, { text: trimmedText });
      setMessages((prevMessages) => [...prevMessages, msg.data]);
      setText("");
      console.log("You sent a message", msg);
    } catch (error) {
      console.error("Failed to send a message", error);
      setError("Failed to send a message");
    } finally {
      setIsSending(false);
    }
  };

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
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="message"></label>
          <input
            id="message"
            type="text"
            value={text}
            placeholder="Write a message..."
            maxLength={1000}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
        <button type="submit" disabled={isSending || !text.trim()}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
};

export default ConversationPage;
