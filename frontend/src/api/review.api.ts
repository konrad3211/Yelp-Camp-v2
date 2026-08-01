import type {
  CreateReviewData,
  CreateReviewResponse,
  DeleteReviewResponse,
  GetReviewsResponse,
  Review,
} from "@/types/review";
import { api, publicApi } from "./axios";

type updateData = {
  rating: number;
  text: string;
};

type updateReviewResponse = {
  success: boolean;
  message: string;
  data: Review;
};

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

export const updateReview = async (
  campgroundId: string,
  reviewId: string,
  updateData: updateData,
) => {
  const response = await api.patch<updateReviewResponse>(
    `/campgrounds/${campgroundId}/reviews/${reviewId}`,
    updateData,
  );
  return response.data;
};

export const getReviews = async (
  campgroundId: string,
  page = 1,
  limit = 10,
) => {
  const response = await publicApi.get<GetReviewsResponse>(
    `/campgrounds/${campgroundId}/reviews`,
    {
      params: {
        page,
        limit,
      },
    },
  );

  return response.data;
};
