import { useEffect, useRef, useState, type SubmitEventHandler } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

import { getCampgrounds } from "@/api/campground.api";
import type { Campground } from "@/types/campground";
import { useAuthStore } from "@/store/auth.store";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
  });

  const [checkInDate, setCheckInDate] = useState("");

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const currentUser = useAuthStore((state) => state.user);

  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state ?? {};

  const today = new Date();

  const todayFormatted = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    if (state?.action === "updateCampground") {
      toast.warning("You are not the author");

      navigate(state.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [state.action, state.pathname, navigate]);

  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        setError("");

        const data = await getCampgrounds(searchParams);

        setCampgrounds(data.data);
      } catch (error) {
        console.error("Failed to fetch campgrounds:", error);

        setError("Failed to fetch campgrounds");

        toast.warning(
          error.response?.data?.message ?? "Failed to fetch campgrounds",
        );
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    };

    fetchCampgrounds();
  }, [searchParams]);

  const handleSearch: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const location = formData.get("location");
    const checkIn = formData.get("checkIn");
    const checkOut = formData.get("checkOut");

    setIsSearching(true);

    setSearchParams({
      location: location?.toString() ?? "",
      checkIn: checkIn?.toString() ?? "",
      checkOut: checkOut?.toString() ?? "",
    });
  };

  if (isLoading) {
    return <p>Loading campgrounds...</p>;
  }

  return (
    <section>
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-14">
          {currentUser?.fullName ? (
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Where to next, {currentUser.fullName.split(" ")[0]}?
            </h1>
          ) : (
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Find your next campground
            </h1>
          )}

          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Discover unique places added by the YelpCamp community and find your
            next stay.
          </p>
        </div>

        <div className="absolute bottom-0 left-1/2 w-full max-w-7xl translate-y-1/2 -translate-x-1/2 px-6">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border bg-background p-2 shadow-lg"
          >
            <div className="grid gap-1 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              {/* LOCATION */}
              <div className="flex min-h-18 items-center gap-3 rounded-xl px-4 transition hover:bg-muted/40">
                <MapPin className="size-6 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="location"
                    className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Where do you want to go?"
                    className="mt-1 w-full bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* CHECK IN */}
              <div
                onClick={() => checkInRef.current?.showPicker()}
                className="flex min-h-18 cursor-pointer items-center gap-3 rounded-xl border-t px-4 transition hover:bg-muted/40 md:border-l md:border-t-0"
              >
                <CalendarDays className="size-6 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="checkIn"
                    className="block cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Check in
                  </label>

                  <input
                    ref={checkInRef}
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    min={todayFormatted}
                    onChange={(event) => setCheckInDate(event.target.value)}
                    className="mt-1 w-full cursor-pointer bg-transparent text-sm font-medium outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
              </div>

              {/* CHECK OUT */}
              <div
                onClick={() => checkOutRef.current?.showPicker()}
                className="flex min-h-18 cursor-pointer items-center gap-3 rounded-xl border-t px-4 transition hover:bg-muted/40 md:border-l md:border-t-0"
              >
                <CalendarDays className="size-6 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="checkOut"
                    className="block cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Check out
                  </label>

                  <input
                    ref={checkOutRef}
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    min={checkInDate || todayFormatted}
                    className="mt-1 w-full cursor-pointer bg-transparent text-sm font-medium outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
              </div>

              {/* SEARCH */}
              <Button
                type="submit"
                disabled={isSearching}
                className="min-h-14 rounded-xl px-7 md:min-h-18"
              >
                <Search className="size-5" />

                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Find your next campground
          </h2>

          <p className="mt-2 text-muted-foreground">
            Discover places added by the YelpCamp community.
          </p>
        </div>

        {isSearching ? (
          <p className="text-muted-foreground">Loading campgrounds...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : campgrounds.length === 0 ? (
          <div className="rounded-xl border bg-muted/20 p-10 text-center">
            <p className="font-medium">No campgrounds found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing the location or selected dates.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campgrounds.map((campground) => {
              const mainImage = campground.images[0];

              return (
                <Card
                  key={campground._id}
                  className="flex h-full flex-col overflow-hidden pt-0"
                >
                  {mainImage ? (
                    <img
                      src={mainImage.url}
                      alt={campground.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-muted">
                      <span className="text-sm text-muted-foreground">
                        No image
                      </span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle>{campground.title}</CardTitle>

                    <p className="text-sm text-muted-foreground">
                      {campground.location}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-sm">
                      {campground.description}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <span className="font-semibold">
                      {campground.price} zł / night
                    </span>

                    <div className="flex gap-2">
                      <Button
                        render={<Link to={`/campgrounds/${campground._id}`} />}
                        nativeButton={false}
                      >
                        View
                      </Button>

                      {currentUser?._id === campground.author._id && (
                        <Button
                          variant="outline"
                          render={
                            <Link
                              to={`/campgrounds/${campground._id}/update`}
                            />
                          }
                          nativeButton={false}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePage;
