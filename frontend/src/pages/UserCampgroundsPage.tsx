import { getBookingsStats } from "@/api/booking.api";
import { getUserCampgrounds } from "@/api/campground.api";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import type { Campground } from "@/types/campground";
import { MapPin, Plus, TentTree } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const UserCampgroundsPage = () => {
  const { userId } = useParams<{ userId: string }>();

  const currentUser = useAuthStore((state) => state.user);
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [bookingStats, setBookingStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser || !userId) return;
    const fetchCampgrounds = async () => {
      try {
        setError("");
        const data = await getUserCampgrounds(userId);
        setCampgrounds(data.data);
      } catch (error) {
        console.error("Failed to fetch user campgrounds", error);
        setError("Failed to fetch user campgrounds");
        toast.error(error.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampgrounds();
  }, [currentUser, userId]);

  useEffect(() => {
    const fetchBookingsCount = async () => {
      try {
        const data = await getBookingsStats();
        setBookingStats(data.data);
      } catch (error) {
        console.error("Failed to fetch number of bookings");
      }
    };
    fetchBookingsCount();
  }, []);

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        state={{
          action: "fetchUserCampgrounds",
          from: `/campgrounds/user/${userId}`,
        }}
        replace
      />
    );
  }

  if (!userId) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (campgrounds.length === 0 && currentUser._id === userId) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border bg-muted/20 px-6 py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background shadow-sm">
            <TentTree className="size-6 text-muted-foreground" />
          </div>

          <h2 className="mt-5 text-2xl font-semibold">
            You haven't added any campgrounds yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Create your first campground and start sharing it with the YelpCamp
            community.
          </p>

          <div className="mt-6">
            <Button
              nativeButton={false}
              render={<Link to="/campgrounds/new" />}
            >
              <Plus className="size-4" />
              Add your first campground
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (campgrounds.length === 0 && currentUser._id !== userId) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border bg-muted/20 px-6 py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background shadow-sm">
            <TentTree className="size-6 text-muted-foreground" />
          </div>

          <h2 className="mt-5 text-2xl font-semibold">No campgrounds yet</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            This user hasn't added any campgrounds yet.
          </p>

          <div className="mt-6">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/" />}
            >
              Browse campgrounds
            </Button>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentUser._id === userId ? "My campgrounds" : "User campgrounds"}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {currentUser._id === userId
              ? "Manage your listings, bookings and availability."
              : "Browse campgrounds added by this user."}
          </p>
        </div>

        {currentUser._id === userId && (
          <Button nativeButton={false} render={<Link to="/campgrounds/new" />}>
            <Plus className="size-4" />
            Add campground
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {campgrounds.map((campground) => {
          const stats = bookingStats.find(
            (item) => item._id === campground._id,
          );

          const mainImage = campground.images[0];
          const isOwner = currentUser._id === campground.author._id;

          const bookingsCount = stats?.bookingsCount ?? 0;
          const revenue = stats?.revenue ?? 0;

          return (
            <Card
              key={campground._id}
              className="overflow-hidden p-0 transition-shadow hover:shadow-md"
            >
              <div className="grid md:grid-cols-[290px_1fr]">
                <div className="relative min-h-56 overflow-hidden bg-muted md:min-h-full">
                  {mainImage ? (
                    <img
                      src={mainImage.url}
                      alt={campground.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full min-h-56 items-center justify-center">
                      <TentTree className="size-7 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col">
                  <CardHeader className="px-6 pb-4 pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <CardTitle className="text-2xl">
                          {campground.title}
                        </CardTitle>

                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4 shrink-0" />

                          <span className="truncate">
                            {campground.location}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <p className="text-xl font-bold">
                          {campground.price} zł
                        </p>

                        <p className="text-xs text-muted-foreground">
                          per night
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 px-6">
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {campground.description}
                    </p>

                    {isOwner && (
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border bg-muted/20 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Total bookings
                          </p>

                          <p className="mt-1 text-xl font-semibold">
                            {bookingsCount}
                          </p>
                        </div>

                        <div className="rounded-xl border bg-muted/20 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Revenue
                          </p>

                          <p className="mt-1 text-xl font-semibold">
                            {revenue.toLocaleString("pl-PL")} zł
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="mt-5 flex flex-col gap-3 border-t bg-muted/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-muted-foreground">
                      {campground.images.length}{" "}
                      {campground.images.length === 1 ? "photo" : "photos"}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link to={`/campgrounds/${campground._id}`} />}
                      >
                        View campground
                      </Button>

                      {isOwner && (
                        <Button
                          variant="outline"
                          nativeButton={false}
                          render={
                            <Link
                              to={`/campgrounds/${campground._id}/bookings`}
                              state={{
                                from: `/campgrounds/user/${userId}`,
                              }}
                            />
                          }
                        >
                          View bookings
                        </Button>
                      )}

                      {isOwner && (
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              to={`/campgrounds/${campground._id}/update`}
                            />
                          }
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default UserCampgroundsPage;
