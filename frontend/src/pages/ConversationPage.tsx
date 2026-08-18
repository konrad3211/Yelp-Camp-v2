import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useRef, useState, type SubmitEventHandler } from "react";
import {
  createMessage,
  getConversationMessages,
  markMessagesAsRead,
} from "../api/conversation.api";
import type { Message } from "../types/message";
import { socket } from "../lib/socket";
import { ArrowLeft, CheckCheck, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLoader from "@/components/PageLoader";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();

  const currentUser = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledInitially = useRef(false);

  useEffect(() => {
    hasScrolledInitially.current = false;
  }, [id]);

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
    const handleNewMessage = async (newMessage: Message) => {
      if (newMessage.conversation !== id) {
        return;
      }

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
    const handleMessagesRead = ({
      conversationId,
      messageIds,
    }: {
      conversationId: string;
      messageIds: string[];
    }) => {
      if (conversationId !== id) {
        return;
      }

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

  useEffect(() => {
    hasScrolledInitially.current = false;
  }, [id]);

  useEffect(() => {
    if (isLoading || messages.length === 0) {
      return;
    }

    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    if (!hasScrolledInitially.current) {
      container.scrollTop = container.scrollHeight;
      hasScrolledInitially.current = true;
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!id || !trimmedText || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const msg = await createMessage(id, {
        text: trimmedText,
      });

      setMessages((previousMessages) => [...previousMessages, msg.data]);

      setText("");
    } catch (error) {
      console.error("Failed to send a message", error);

      setError("Failed to send a message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error && messages.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-destructive">{error}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <Card className="flex h-[78vh] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon"
            render={<Link to="/conversations" />}
          >
            <ArrowLeft className="size-5" />
          </Button>

          <div>
            <h1 className="font-semibold">Conversation</h1>

            <p className="text-xs text-muted-foreground">
              Messages are updated in real time
            </p>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 py-6"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="font-medium">No messages yet</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Send the first message below.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender._id === currentUser?._id;

                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[75%] flex-col ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      {!isOwnMessage && (
                        <span className="mb-1 px-1 text-xs font-medium text-muted-foreground">
                          {message.sender.username}
                        </span>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isOwnMessage
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border bg-background"
                        }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">
                          {message.text}
                        </p>
                      </div>

                      <div
                        className={`mt-1 flex items-center gap-1 px-1 text-[11px] text-muted-foreground ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>
                          {new Date(message.createdAt).toLocaleString("pl-PL", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {isOwnMessage && (
                          <span className="flex items-center gap-1">
                            <CheckCheck className="size-3.5" />

                            {message.isRead ? "Read" : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t bg-background p-4">
          {error && messages.length > 0 && (
            <p className="mb-2 text-sm text-destructive">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="message" className="sr-only">
                Message
              </label>

              <textarea
                id="message"
                value={text}
                placeholder="Write a message..."
                maxLength={1000}
                rows={1}
                disabled={isSending}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();

                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                className="max-h-32 min-h-11 w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="mt-1 text-right text-[11px] text-muted-foreground">
                {text.length}/1000
              </div>
            </div>

            <Button
              type="submit"
              size="icon"
              className="size-11 shrink-0 rounded-xl"
              disabled={isSending || !text.trim()}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
};

export default ConversationPage;
