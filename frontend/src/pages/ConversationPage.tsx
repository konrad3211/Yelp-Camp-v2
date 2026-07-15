import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useState, type SubmitEventHandler } from "react";
import {
  createMessage,
  getConversationMessages,
  markMessagesAsRead,
} from "../api/conversation.api";
import type { Message } from "../types/message";
import { socket } from "../lib/socket";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();

  const currentUser = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<Message[]>([]);
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
        await markMessagesAsRead(id);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setError("Failed to fetch messages");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [id]);

  useEffect(() => {
    //Tworzysz funkcję, która wykona się za każdym razem, gdy backend wyemituje: newMessage
    const handleNewMessage = async (newMessage: Message) => {
      if (newMessage.conversation !== id) return;

      setMessages((currentMessages) => [...currentMessages, newMessage]);

      if (id) {
        try {
          await markMessagesAsRead(id);
        } catch (error) {
          console.error("Failed to mark message as read:", error);
        }
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [id]);

  useEffect(() => {
    //Tworzysz funkcję, która wykona się za każdym razem, gdy backend wyemituje: messagesRead
    const handleMessagesRead = ({
      conversationId,
      messageIds,
    }: {
      conversationId: string;
      messageIds: string[];
    }) => {
      if (conversationId !== id) return;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          messageIds.includes(message._id)
            ? {
                ...message,
                isRead: true,
              }
            : message,
        ),
      );
    };

    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [id]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!id || !trimmedText) return;
    try {
      setIsSending(true);
      setError("");
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
              {isOwnMessage && <p>{message.isRead ? "Read" : "Sent"}</p>}
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
