import { useState, type SubmitEventHandler } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { startConversation } from "@/api/conversation.api";
import { Button } from "@/components/ui/button";

type NewConversationLocationState = {
  campgroundId?: string;
};

const NewConversationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as NewConversationLocationState | null;

  const campgroundId = state?.campgroundId;

  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  if (!campgroundId) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const trimmedText = messageText.trim();

    if (!trimmedText || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const data = await startConversation(campgroundId, {
        text: trimmedText,
      });

      navigate(`/conversations/${data.data.conversation._id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Contact owner</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Write your message..."
          disabled={isSending}
          className="min-h-40 w-full rounded-md border bg-background px-3 py-2"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={isSending || !messageText.trim()}>
          {isSending ? "Sending..." : "Send message"}
        </Button>
      </form>
    </section>
  );
};

export default NewConversationPage;
