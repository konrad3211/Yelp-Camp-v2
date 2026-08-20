import { cancelUserBooking, getUserBookings } from "@/api/booking.api";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import type { Booking } from "@/types/booking";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, Eye } from "lucide-react";

const BookingsPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<
    "all" | "confirmed" | "pending" | "cancelled"
  >("all");
  const [fetchBookingsError, setFetchBookingsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setFetchBookingsError("");

        const data = await getUserBookings();

        console.log(data.data);

        setBookings(data.data);
      } catch (error) {
        console.error("Failed to fetch user bookings:", error);

        setFetchBookingsError("Failed to fetch user bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const data = await cancelUserBooking(bookingId);

      setBookings((prevBookings) => {
        const bookings = prevBookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                ...data.data,
              }
            : booking,
        );

        return bookings;
      });
    } catch (error) {
      console.error("Failed to cancel a booking", error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") {
      return true;
    }

    return booking.status === filter;
  });

  const statuses = new Set(bookings.map((booking) => booking.status));

  if (isLoading) {
    return <PageLoader />;
  }

  if (fetchBookingsError) {
    return <p className="text-destructive">{fetchBookingsError}</p>;
  }

  if (bookings.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border bg-muted/20 px-6 py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background shadow-sm">
            <CalendarDays className="size-6 text-muted-foreground" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">No bookings yet</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            You haven't booked any campgrounds yet. Explore available places and
            plan your next stay.
          </p>

          <div className="mt-6">
            <Button nativeButton={false} render={<Link to="/" />}>
              Browse campgrounds
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Your bookings,{" "}
          {currentUser?.fullName && `${currentUser.fullName.split(" ")[0]}`}
        </h1>

        <p className="text-muted-foreground">
          Manage your upcoming and previous campground stays.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border bg-muted/20 p-2">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
          className="rounded-lg"
        >
          All
        </Button>

        {statuses.has("confirmed") && (
          <Button
            variant={filter === "confirmed" ? "default" : "ghost"}
            onClick={() => setFilter("confirmed")}
            className="rounded-lg"
          >
            Confirmed
          </Button>
        )}

        {statuses.has("pending") && (
          <Button
            variant={filter === "pending" ? "default" : "ghost"}
            onClick={() => setFilter("pending")}
            className="rounded-lg"
          >
            Pending
          </Button>
        )}

        {statuses.has("cancelled") && (
          <Button
            variant={filter === "cancelled" ? "default" : "ghost"}
            onClick={() => setFilter("cancelled")}
            className="rounded-lg"
          >
            Cancelled
          </Button>
        )}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border bg-muted/20 px-6 py-16 text-center">
          <p className="font-semibold">
            You do not have any bookings with this status
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try selecting a different filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredBookings.map((booking) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);

            return (
              <Card
                key={booking._id}
                className="overflow-hidden p-0 transition-shadow hover:shadow-md"
              >
                <div className="grid h-full md:grid-cols-[220px_1fr]">
                  <div className="relative min-h-56 overflow-hidden bg-muted">
                    {booking.campground?.images?.[0]?.url ? (
                      <img
                        src={booking.campground.images[0].url}
                        alt={booking.campground.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-56 items-center justify-center text-sm text-muted-foreground">
                        No image
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span
                        className={
                          booking.status === "confirmed"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm"
                            : booking.status === "pending"
                              ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm"
                        }
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <CardHeader className="space-y-2 px-6 pb-4 pt-6">
                      <div>
                        <CardTitle className="text-xl">
                          {booking.campground.title}
                        </CardTitle>

                        <p
                          title={booking.campground.formattedLocation}
                          className="mt-1 truncate text-sm text-muted-foreground"
                        >
                          {booking.campground.location}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-5 px-6">
                      <div className="grid grid-cols-2 overflow-hidden rounded-xl border">
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Check-in
                          </p>

                          <p className="mt-1 font-semibold">
                            {checkIn.toLocaleDateString("pl-PL", {
                              timeZone: "Europe/Warsaw",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            15:00
                          </p>
                        </div>

                        <div className="border-l p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Check-out
                          </p>

                          <p className="mt-1 font-semibold">
                            {checkOut.toLocaleDateString("pl-PL", {
                              timeZone: "Europe/Warsaw",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            12:00
                          </p>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {booking.numberOfNights}{" "}
                            {booking.numberOfNights === 1 ? "night" : "nights"}
                          </p>

                          <p className="text-xl font-bold">
                            {booking.totalPrice} zł
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {booking.pricePerNight} zł / night
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-wrap justify-end gap-2 border-t bg-muted/10 p-4">
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                          <Link to={`/campgrounds/${booking.campground._id}`} />
                        }
                      >
                        <Eye className="size-4" />
                        View campground
                      </Button>

                      {(booking.status === "confirmed" ||
                        booking.status === "pending") && (
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              />
                            }
                          >
                            Cancel
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancel this booking?
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                Are you sure you want to cancel your reservation
                                at{" "}
                                <span className="font-medium text-foreground">
                                  {booking.campground.title}
                                </span>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Go back</AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => handleCancelBooking(booking._id)}
                              >
                                Yes, cancel booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {booking.status === "pending" && (
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              to={`/bookings/${booking._id}/payment`}
                              state={{
                                action: "payNow",
                                from: "/bookings",
                              }}
                            />
                          }
                        >
                          Pay now
                        </Button>
                      )}

                      {booking.status === "confirmed" && (
                        <Button
                          variant="outline"
                          nativeButton={false}
                          render={
                            <Link
                              to={`/bookings/${booking._id}/success`}
                              state={{
                                action: "showConfirmation",
                                from: "/bookings",
                              }}
                            />
                          }
                        >
                          Confirmation
                        </Button>
                      )}
                    </CardFooter>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BookingsPage;
