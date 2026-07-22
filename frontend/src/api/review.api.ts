import type {
  CreateReviewData,
  CreateReviewResponse,
  DeleteReviewResponse,
} from "@/types/review";
import { api } from "./axios";

export const createReview = async (
  campgroundId: string,
  reviewData: CreateReviewData,
) => {
  const response = await api.post<CreateReviewResponse>(
    `/campgrounds/${campgroundId}/reviews`,
    reviewData,
  );
  return response.data;
};

export const deleteReview = async (campgroundId: string, reviewId: string) => {
  const response = await api.delete<DeleteReviewResponse>(
    `/campgrounds/${campgroundId}/reviews/${reviewId}`,
  );
  return response.data;
};
