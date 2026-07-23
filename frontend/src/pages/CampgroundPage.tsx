import { useEffect, useState, type SubmitEventHandler } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Star, Trash2 } from "lucide-react";

import { getCampground } from "@/api/campground.api";
import { createConversation } from "@/api/conversation.api";
import { createReview, deleteReview, updateReview } from "@/api/review.api";

import type { Campground } from "@/types/campground";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuthStore } from "@/store/auth.store";

const CampgroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);

  const [campground, setCampground] = useState<Campground | null>(null);

  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");

  const [editedReviewId, setEditedReviewId] = useState<string | null>(null);
  const [editedRating, setEditedRating] = useState<number | null>(null);
  const [editedReviewText, setEditedReviewText] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isPostingReview, setIsPostingReview] = useState(false);
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [updateReviewError, setUpdateReviewError] = useState("");
  const [deleteReviewError, setDeleteReviewError] = useState("");

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

  const calculateAverageRating = (reviews: Campground["reviews"]) => {
    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

    return totalRating / reviews.length;
  };

  const handleCreateReview: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    if (
      !campground ||
      !currentUser ||
      rating === null ||
      !reviewText.trim() ||
      isPostingReview
    ) {
      return;
    }

    try {
      setIsPostingReview(true);
      setReviewError("");

      const data = await createReview(campground._id, {
        rating,
        text: reviewText.trim(),
      });

      setCampground((previousCampground) => {
        if (!previousCampground) {
          return previousCampground;
        }

        const updatedReviews = [...previousCampground.reviews, data.data];

        return {
          ...previousCampground,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          averageRating: calculateAverageRating(updatedReviews),
        };
      });

      setRating(null);
      setReviewText("");
    } catch (error) {
      console.error("Failed to create a review:", error);

      setReviewError("Failed to create a review");
    } finally {
      setIsPostingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!campground || deletingReviewId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReviewId(reviewId);
      setDeleteReviewError("");

      await deleteReview(campground._id, reviewId);

      setCampground((previousCampground) => {
        if (!previousCampground) {
          return previousCampground;
        }

        const updatedReviews = previousCampground.reviews.filter(
          (review) => review._id !== reviewId,
        );

        return {
          ...previousCampground,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          averageRating: calculateAverageRating(updatedReviews),
        };
      });

      if (editedReviewId === reviewId) {
        setEditedReviewId(null);
        setEditedRating(null);
        setEditedReviewText("");
      }
    } catch (error) {
      console.error("Failed to delete a review:", error);

      setDeleteReviewError("Failed to delete the review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleStartEditing = (
    reviewId: string,
    reviewText: string,
    reviewRating: number,
  ) => {
    setEditedReviewId(reviewId);
    setEditedReviewText(reviewText);
    setEditedRating(reviewRating);

    setUpdateReviewError("");
    setDeleteReviewError("");
  };

  const handleCancelEditing = () => {
    setEditedReviewId(null);
    setEditedRating(null);
    setEditedReviewText("");
    setUpdateReviewError("");
  };

  const handleUpdateReview: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    if (
      !campground ||
      !editedReviewId ||
      editedRating === null ||
      !editedReviewText.trim() ||
      isUpdatingReview
    ) {
      return;
    }

    const originalReview = campground.reviews.find(
      (review) => review._id === editedReviewId,
    );

    if (!originalReview) {
      return;
    }

    const trimmedText = editedReviewText.trim();

    if (
      trimmedText === originalReview.text &&
      editedRating === originalReview.rating
    ) {
      handleCancelEditing();
      return;
    }

    try {
      setIsUpdatingReview(true);
      setUpdateReviewError("");

      const data = await updateReview(campground._id, editedReviewId, {
        rating: editedRating,
        text: trimmedText,
      });

      setCampground((previousCampground) => {
        if (!previousCampground) {
          return previousCampground;
        }

        const updatedReviews = previousCampground.reviews.map((review) =>
          review._id === editedReviewId
            ? {
                ...review,
                ...data.data,
              }
            : review,
        );

        return {
          ...previousCampground,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          averageRating: calculateAverageRating(updatedReviews),
        };
      });

      setEditedReviewId(null);
      setEditedRating(null);
      setEditedReviewText("");
    } catch (error) {
      console.error("Failed to edit a review:", error);

      setUpdateReviewError("Failed to edit the review");
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleContactOwner = async () => {
    if (!campground) {
      return;
    }

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

            <CardContent className="space-y-6">
              {currentUser ? (
                <form
                  onSubmit={handleCreateReview}
                  className="space-y-4 rounded-xl border bg-muted/20 p-4"
                >
                  <div>
                    <p className="mb-2 text-sm font-medium">Your rating</p>

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          disabled={isPostingReview}
                          className="rounded-md p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Rate ${star} out of 5`}
                        >
                          <Star
                            className={
                              star <= (rating ?? 0)
                                ? "size-7 fill-yellow-400 text-yellow-400"
                                : "size-7 text-muted-foreground"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reviewText"
                      className="mb-2 block text-sm font-medium"
                    >
                      Your review
                    </label>

                    <textarea
                      id="reviewText"
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      placeholder="Share your experience..."
                      disabled={isPostingReview}
                      className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  {reviewError && (
                    <p className="text-sm text-destructive">{reviewError}</p>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        isPostingReview || rating === null || !reviewText.trim()
                      }
                    >
                      {isPostingReview ? "Posting..." : "Post review"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">
                    Log in to add a review.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </Button>
                </div>
              )}

              {deleteReviewError && (
                <p className="text-sm text-destructive">{deleteReviewError}</p>
              )}

              {campground.reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {campground.reviews.map((review) =>
                    editedReviewId === review._id ? (
                      <form
                        key={review._id}
                        onSubmit={handleUpdateReview}
                        className="space-y-4 rounded-xl border bg-muted/20 p-4"
                      >
                        <div>
                          <p className="mb-2 text-sm font-medium">Rating</p>

                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditedRating(star)}
                                disabled={isUpdatingReview}
                                className="rounded-md p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Rate ${star} out of 5`}
                              >
                                <Star
                                  className={
                                    star <= (editedRating ?? 0)
                                      ? "size-7 fill-yellow-400 text-yellow-400"
                                      : "size-7 text-muted-foreground"
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-text-${review._id}`}
                            className="mb-2 block text-sm font-medium"
                          >
                            Review
                          </label>

                          <textarea
                            id={`edit-text-${review._id}`}
                            value={editedReviewText}
                            onChange={(event) =>
                              setEditedReviewText(event.target.value)
                            }
                            disabled={isUpdatingReview}
                            className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          />
                        </div>

                        {updateReviewError && (
                          <p className="text-sm text-destructive">
                            {updateReviewError}
                          </p>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUpdatingReview}
                            onClick={handleCancelEditing}
                          >
                            Cancel
                          </Button>

                          <Button
                            type="submit"
                            disabled={
                              isUpdatingReview ||
                              editedRating === null ||
                              !editedReviewText.trim()
                            }
                          >
                            {isUpdatingReview ? "Saving..." : "Save changes"}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <article
                        key={review._id}
                        className="rounded-xl border p-4"
                      >
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {review.author.username}
                            </p>

                            <div
                              className="mt-1 flex"
                              aria-label={`${review.rating} out of 5 stars`}
                            >
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={
                                    star <= review.rating
                                      ? "size-4 fill-yellow-400 text-yellow-400"
                                      : "size-4 text-muted-foreground"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          {review.author._id === currentUser?._id && (
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleStartEditing(
                                    review._id,
                                    review.text,
                                    review.rating,
                                  )
                                }
                                aria-label="Edit review"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="size-4" />
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteReview(review._id)}
                                disabled={deletingReviewId === review._id}
                                aria-label="Delete review"
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <p>{review.text}</p>

                        <small className="mt-2 block text-muted-foreground">
                          {new Date(
                            review.updatedAt ?? review.createdAt,
                          ).toLocaleString()}
                        </small>
                      </article>
                    ),
                  )}
                </div>
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

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={
                        star <= Math.round(campground.averageRating ?? 0)
                          ? "size-4 fill-yellow-400 text-yellow-400"
                          : "size-4 text-muted-foreground"
                      }
                    />
                  ))}
                </div>

                <span className="text-sm">
                  {(campground.averageRating ?? 0).toFixed(1)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {campground.reviewCount ?? campground.reviews.length}{" "}
                {(campground.reviewCount ?? campground.reviews.length) === 1
                  ? "review"
                  : "reviews"}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default CampgroundPage;
