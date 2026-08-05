import { getBooking, payForBooking } from "@/api/booking.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/types/booking";
import { Button } from "@base-ui/react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const FakePaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

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
      (navigate(`/bookings/${booking._id}/success`),
        {
          replace: true,
        });
    } catch (error) {
      console.error("Failed to pay for bookoing", error);
      setError("Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return <p>Loading booking...</p>;
  }
  if (error && !booking) {
    return <p>{error}</p>;
  }
  if (!booking) {
    return <p>Booking not found</p>;
  }
  return (
    <section className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="font-semibold">{booking.campground.title}</p>

            <p className="text-sm text-muted-foreground">
              {booking.campground.location}
            </p>
          </div>

          <div className="space-y-1 text-sm">
            <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>

            <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>

            <p>
              {booking.pricePerNight} zł × {booking.numberOfNights} nights
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xl font-semibold">
              Total: {booking.totalPrice} zł
            </p>
          </div>

          <div className="rounded-md border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              This is a test payment. No real money will be charged.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="button"
            className="w-full"
            disabled={isPaying || booking.paymentStatus === "paid"}
            onClick={handlePayment}
          >
            {booking.paymentStatus === "paid"
              ? "Paid"
              : isPaying
                ? "Processing..."
                : `Pay ${booking.totalPrice} zł`}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default FakePaymentPage;
