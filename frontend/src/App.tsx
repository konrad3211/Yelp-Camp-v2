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
import NewConversationPage from "./pages/NewConversationPage";
import FakePaymentPage from "./pages/FakePaymentPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import CreateCampgroundPage from "./pages/CreateCampgroundPage";
import UpdateCampgroundPage from "./pages/UpdateCampgroundPage";
import BookingsPage from "./pages/BookingsPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";
import PageLoader from "./components/PageLoader";
import UserCampgroundsPage from "./pages/UserCampgroundsPage";

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
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/campgrounds/:id" element={<CampgroundPage />} />
        <Route
          path="/campgrounds/user/:userId"
          element={<UserCampgroundsPage />}
        />
        <Route path="/campgrounds/new" element={<CreateCampgroundPage />} />

        <Route
          path="/bookings"
          element={
            user ? (
              <BookingsPage />
            ) : (
              <Navigate
                to="/login"
                state={{ action: "fetchBookings", from: "/bookings" }}
              />
            )
          }
        />

        <Route
          path="/campgrounds/:id/update"
          element={<UpdateCampgroundPage />}
        />

        <Route
          path="/conversations"
          element={
            user ? (
              <ConversationsPage />
            ) : (
              <Navigate
                to="/login"
                replace
                state={{ action: "fetchConversations", from: "/conversations" }}
              />
            )
          }
        />

        <Route path="/conversations/new" element={<NewConversationPage />} />

        <Route
          path="/conversations/:id"
          element={
            user ? <ConversationPage /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/profile"
          element={
            user ? <UserProfilePage /> : <Navigate to="/login" replace />
          }
        />
      </Route>

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      <Route
        path="/bookings/:bookingId/payment"
        element={user ? <FakePaymentPage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/bookings/:bookingId/success"
        element={<BookingSuccessPage />}
      />
    </Routes>
  );
};

export default App;
