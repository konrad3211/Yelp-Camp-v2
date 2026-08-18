import { useState, type SubmitEventHandler } from "react";
import { login } from "../api/auth.api";
import { useLocation, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // location.state przechowuje informację, jaką akcję użytkownik
  // chciał wykonać przed przejściem na stronę logowania.
  const locationState = location.state as {
    action?:
      | "contactOwner"
      | "createReview"
      | "updateCampground"
      | "fetchBookings";
    campgroundId?: string;
    from: string;
  } | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      await login({
        email,
        password,
      });

      if (
        locationState?.action === "createReview" &&
        locationState?.campgroundId
      ) {
        navigate(`/campgrounds/${locationState.campgroundId}`, {
          replace: true,
          state: {
            action: "createReview",
          },
        });
        return;
      }

      if (
        locationState?.action === "contactOwner" &&
        locationState?.campgroundId
      ) {
        navigate(`/conversations/new`, {
          replace: true,
          state: {
            campgroundId: locationState.campgroundId,
          },
        });
        return;
      }

      if (
        (locationState?.action === "fetchBookings" ||
          locationState?.action === "updateCampground") &&
        locationState?.from
      ) {
        navigate(locationState.from, {
          replace: true,
        });
        return;
      }

      //jak powyzsze warunki sie nie wykonaja to przeniesie nas po zalogowaniu na homepage
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login flow failed:", error);
      setError("Failed to log in or open conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Log in</h1>

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
