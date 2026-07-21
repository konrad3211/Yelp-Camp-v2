import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import { refreshAuth } from "./api/auth.api";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import HomePage from "./pages/HomePage";
import ConversationsPage from "./pages/ConversationsPage";
import ConversationPage from "./pages/ConversationPage";
import { socket } from "./lib/socket";
import { toast } from "sonner";
import type { Message } from "./types/message";
import AppLayout from "@/layouts/AppLayout";
import CampgroundPage from "./pages/CampgroundPage";

const App = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await refreshAuth();
      } catch (error) {
        console.log("User is not logged in:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      socket.disconnect();
      return;
    }
    socket.auth = {
      token: accessToken,
    };

    socket.connect();

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection failed:", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    const handleNewMessagesNotification = (newMessage: Message) => {
      const openedConversationPath = `/conversations/${newMessage.conversation}`;

      if (location.pathname === openedConversationPath) return;

      toast.info(`New message from  ${newMessage.sender.username}`, {
        description: newMessage.text,
      });
    };
    socket.on("newMessage", handleNewMessagesNotification);

    return () => {
      socket.off("newMessage", handleNewMessagesNotification);
    };
  }, [location.pathname, accessToken]);

  //to wyswietla Loading... i blokuje przejscie do routes przez co jak sie laduje to routy sie nie beda odpalaly co zapobiegnie roznym rzeczom
  if (isAuthLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/campgrounds/:id" element={<CampgroundPage />} />

        <Route
          path="/conversations"
          element={
            user ? <ConversationsPage /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/conversations/:id"
          element={
            user ? <ConversationPage /> : <Navigate to="/login" replace />
          }
        />
      </Route>

      <Route
        path="/login"
        //replace nie pozwala cofnac do poprzedniej strony w przegladarce
        element={<LoginPage />}
      />
    </Routes>
  );
};

export default App;
