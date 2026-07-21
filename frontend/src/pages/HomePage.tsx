import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCampgrounds } from "@/api/campground.api";
import type { Campground } from "@/types/campground";

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
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        setError("");
        const data = await getCampgrounds();
        setCampgrounds(data.data);
      } catch (error) {
        console.error("Failed to fetch campgrounds:", error);
        setError("Failed to fetch campgrounds");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampgrounds();
  }, []);

  if (isLoading) {
    return <p>Loading campgrounds...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Find your next campground
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover places added by the YelpCamp community.
        </p>
      </div>

      {campgrounds.length === 0 ? (
        <p>No campgrounds found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campgrounds.map((campground) => {
            const mainImage = campground.images[0];

            return (
              <Card key={campground._id} className="overflow-hidden pt-0">
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

                <CardContent>
                  <p className="line-clamp-3 text-sm">
                    {campground.description}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <span className="font-semibold">
                    {campground.price} zł / night
                  </span>

                  <Button
                    render={<Link to={`/campgrounds/${campground._id}`} />}
                  >
                    View
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HomePage;
