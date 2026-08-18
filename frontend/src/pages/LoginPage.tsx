import { useState, type SubmitEventHandler } from "react";
import { login } from "../api/auth.api";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Log in to continue to YelpCamp.
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              New to YelpCamp?
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/register")}
          >
            Create an account
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Discover and book campgrounds added by the YelpCamp community.
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
