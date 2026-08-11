import { useEffect, useState, type SubmitEventHandler } from "react";
import { login } from "../api/auth.api";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

const LoginPage = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // location.state przechowuje informację, jaką akcję użytkownik
  // chciał wykonać przed przejściem na stronę logowania.
  const locationState = location.state as {
    action?: "contactOwner" | "createReview" | "updateCampground";
    campgroundId?: string;
    from: string;
  } | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  //
  useEffect(() => {
    //!isLoading jest poniewaz bez tego od razu po login() przenosilo by nas do /, a ponizej jest jeszcze kod sprawdzajacy czy nie chcemy utworzyc konwersacji
    if (user && !isLoading && !locationState) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

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

      if (
        location.state.action === "createReview" &&
        locationState.campgroundId
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
        locationState.campgroundId
      ) {
        navigate(`/conversations/new`, {
          replace: true,
          state: {
            campgroundId: locationState.campgroundId,
          },
        });
        return;
      }

      if (locationState?.action === "updateCampground" && locationState?.from) {
        navigate(locationState.from, {
          replace: true,
        });
        return;
      }
      //jak powyzszu warunek sie nie wykona to przeniesie nas po zalogowaniu na homepage
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
