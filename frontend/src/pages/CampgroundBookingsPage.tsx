import { getCampgroundBookings } from "@/api/booking.api";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CampgroundBookingsPage = () => {
  const { campgroundId } = useParams();

  const [campgroundBookings, setCampgroundBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchCampgroundBookings = async () => {
      try {
        setError("");
        const data = await getCampgroundBookings(campgroundId);
        setCampgroundBookings(data.data);
      } catch (error) {
        console.error("Failed to fetch campground availability", error);
        setError("Failed to fetch campground availability");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampgroundBookings();
  }, [campgroundId]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (campgroundBookings.length === 0) {
    return <p>This campground does not have any bookings yet.</p>;
  }

  return (
    <div>
      {campgroundBookings.map((booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        return (
          <div>
            <img src={(booking.user as any).imageUrl} alt="" className="w-15" />
            {(booking.user as any).fullName}
            <div>
              {checkIn.toLocaleDateString("pl-PL", {
                timeZone: "Europe/Warsaw",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {" - "}
              {checkOut.toLocaleDateString("pl-PL", {
                timeZone: "Europe/Warsaw",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div> Status: {booking.status}</div>
            <Button>Cancel</Button>
            <Button>Send a message</Button>
          </div>
        );
      })}
    </div>
  );
};

export default CampgroundBookingsPage;
