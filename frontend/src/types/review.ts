import type { CampgroundReview } from "./campground";

export type CreateReviewData = {
  rating: number;
  text: string;
};

type ReviewAuthor = {
  _id: string;
  fullName: string;
  username: string;
  imageUrl: string;
};

export type Review = {
  _id: string;
  author: ReviewAuthor;
  text: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewResponse = {
  success: boolean;
  message: string;
  data: Review;
};

export type DeleteReviewResponse = {
  success: boolean;
  message: string;
};

export type GetReviewsResponse = {
  success: boolean;
  message: string;
  data: {
    reviews: CampgroundReview[];
    page: number;
    limit: number;
    totalReviews: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
