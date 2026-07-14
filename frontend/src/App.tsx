import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import { refreshAuth } from "./api/auth.api";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import HomePage from "./pages/HomePage";
import ConversationsPage from "./pages/ConversationsPage";
import ConversationPage from "./pages/ConversationPage";
import { socket } from "./lib/socket";

const App = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
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

  //to wyswietla Loading... i blokuje przejscie do routes przez co jak sie laduje to routy sie nie beda odpalaly co zapobiegnie roznym rzeczom
  if (isAuthLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        //replace nie pozwala cofnac do poprzedniej strony w przegladarce
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/"
        element={user ? <HomePage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/conversations"
        element={
          user ? <ConversationsPage /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/conversations/:id"
        element={user ? <ConversationPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
