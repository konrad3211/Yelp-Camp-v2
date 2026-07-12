import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import { refreshAuth } from "./api/auth.api";

const App = () => {
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await refreshAuth();
      } catch (error) {
        console.log("User is not logged in", error);
      }
    };
    restoreSession();
  }, []);
  return <LoginPage />;
};

export default App;
