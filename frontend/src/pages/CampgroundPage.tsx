import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getCampground } from "@/api/campground.api";
import type { Campground } from "@/types/campground";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { createConversation } from "@/api/conversation.api";

const CampgroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [campground, setCampground] = useState<Campground | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampground = async () => {
      if (!id) {
        setError("Campground id is missing");
        setIsLoading(false);
        return;
      }

      try {
        setError("");
        const data = await getCampground(id);
        setCampground(data.data);
      } catch (error) {
        console.error("Failed to fetch campground:", error);
        setError("Failed to fetch campground");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampground();
  }, [id]);

  if (isLoading) {
    return <p>Loading campground...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!campground) {
    return <p>Campground not found.</p>;
  }

  const mainImage = campground.images[0];

  const authorInitials = campground.author.fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleContactOwner = async () => {
    if (!currentUser) {
      navigate("/login", {
        state: {
          campgroundId: campground._id,
          action: "contactOwner",
        },
      });
      return;
    }

    if (currentUser._id === campground.author._id) {
      return;
    }

    try {
      const data = await createConversation(campground._id);

      navigate(`/conversations/${data.data._id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <section className="space-y-8">
      <Button variant="ghost" render={<Link to="/" />}>
        Back to campgrounds
      </Button>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={campground.title}
              className="h-105 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-105 items-center justify-center rounded-xl bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}

          {campground.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {campground.images.slice(1).map((image) => (
                <img
                  key={image._id}
                  src={image.url}
                  alt={campground.title}
                  className="h-36 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7">{campground.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {campground.reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                campground.reviews.map((review) => (
                  <article key={review._id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <strong>{review.author.username}</strong>
                      <span>{review.rating}/5</span>
                    </div>

                    <p>{review.text}</p>

                    <small className="text-muted-foreground">
                      {new Date(review.createdAt).toLocaleString()}
                    </small>
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{campground.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{campground.location}</p>

              <p className="text-2xl font-semibold">
                {campground.price} zł
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / night
                </span>
              </p>

              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={campground.author.imageUrl}
                    alt={campground.author.username}
                  />

                  <AvatarFallback>{authorInitials}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{campground.author.fullName}</p>

                  <p className="text-sm text-muted-foreground">
                    @{campground.author.username}
                  </p>
                </div>
              </div>
              {currentUser?._id !== campground.author._id && (
                <Button className="w-full" onClick={handleContactOwner}>
                  Contact owner
                </Button>
              )}

              {campground.averageRating !== undefined && (
                <p>Rating: {campground.averageRating.toFixed(1)}</p>
              )}

              {campground.reviewCount !== undefined && (
                <p>Reviews: {campground.reviewCount}</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default CampgroundPage;
