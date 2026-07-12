import { useState, type SubmitEventHandler } from "react";
import { login } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  console.log("user from store:", user);
  console.log("Access token from store:", accessToken);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      const data = await login({
        email,
        password,
      });

      console.log("You are logged in", data);
    } catch (error) {
      console.log(error);
      setError("Error logging in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Log in</h1>
      {user && <p>Logged in as: {user.username}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging..." : "Log In"}
        </button>
        {error && <p>{error}</p>}
      </form>
    </main>
  );
};

export default LoginPage;
