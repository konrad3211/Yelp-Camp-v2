import { useEffect, useState } from "react";
import { logout } from "../api/auth.api";
import { getMe } from "../api/user.api";
import type { User } from "../types/user";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [user, setUser] = useState<User>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
        console.log(data);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to logout");
    }
  };

  return (
    <main>
      <h1>Home</h1>
      {user && <p>Logged in as: {user.username}</p>}
      <Link to="/conversations">Conversations</Link>
      {error && <p>{error}</p>}
      <button onClick={handleLogout} type="button">
        Log out
      </button>
    </main>
  );
};

export default HomePage;
