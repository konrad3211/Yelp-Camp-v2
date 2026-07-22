export type CreateReviewData = {
  rating: number;
  text: string;
};

type reviewAuthor = {
  _id: string;
  fullName: string;
  username: string;
  imageUrl: string;
};

export type Review = {
  _id: string;
  author: reviewAuthor;
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
