import { getBooking, payForBooking } from "@/api/booking.api";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/types/booking";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const FakePaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();

  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    action?: "payNow" | "createBooking";
    from?: "/bookings" | `/campgrounds/${string}`;
  } | null;

  const [booking, setBooking] = useState<Booking | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        setError("");

        const data = await getBooking(bookingId);

        setBooking(data.data);
      } catch (error) {
        console.log("Failed to fetch booking:", error);

        setError("Failed to fetch booking");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (!bookingId) {
    return <Navigate to="/" replace />;
  }

  const handlePayment = async () => {
    if (!booking || isPaying) return;

    try {
      setIsPaying(true);
      setError("");

      const data = await payForBooking(booking._id);

      setBooking((previousBooking) => {
        if (!previousBooking) return previousBooking;

        return {
          ...previousBooking,
          ...data.data,
        };
      });

      navigate(`/bookings/${booking._id}/success`, {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to pay for booking", error);

      setError("Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error && !booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p>Booking not found</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 pb-16 pt-10">
      {locationState?.action && locationState?.from && (
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link to={locationState.from} />}
          className="mb-4 w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ArrowLeft className="size-4" />

          {locationState.action === "payNow"
            ? "Back to bookings"
            : "Back to campground"}
        </Button>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm">
              <CreditCard className="size-5" />
            </div>

            <div>
              <CardTitle className="text-2xl">Complete your payment</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Review your booking details before confirming payment.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              {booking.campground.title}
            </h2>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />

              <span>{booking.campground.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-xl border">
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-4" />
                Check-in
              </div>

              <p className="mt-2 font-semibold">
                {new Date(booking.checkIn).toLocaleDateString("pl-PL", {
                  timeZone: "Europe/Warsaw",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">15:00</p>
            </div>

            <div className="border-l p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-4" />
                Check-out
              </div>

              <p className="mt-2 font-semibold">
                {new Date(booking.checkOut).toLocaleDateString("pl-PL", {
                  timeZone: "Europe/Warsaw",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">12:00</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {booking.pricePerNight} zł × {booking.numberOfNights}{" "}
                {booking.numberOfNights === 1 ? "night" : "nights"}
              </span>

              <span className="font-medium">{booking.totalPrice} zł</span>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-semibold">Total</span>

              <span className="text-2xl font-bold">
                {booking.totalPrice} zł
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">Test payment</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  This is a simulated checkout. No real money will be charged.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="button"
            className="h-13 w-full rounded-xl text-base font-semibold shadow-sm"
            disabled={isPaying || booking.paymentStatus === "paid"}
            onClick={handlePayment}
          >
            <CreditCard className="size-5" />

            {booking.paymentStatus === "paid"
              ? "Payment completed"
              : isPaying
                ? "Processing payment..."
                : `Pay ${booking.totalPrice} zł`}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you confirm this test booking payment.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default FakePaymentPage;
