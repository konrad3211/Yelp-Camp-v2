export type CampgroundImage = {
  _id: string;
  url: string;
  filename: string;
};

export type CampgroundAuthor = {
  _id: string;
  username: string;
  fullName: string;
  imageUrl: string;
};

export type ReviewAuthor = {
  _id: string;
  username: string;
  fullName: string;
  imageUrl: string;
};

export type CampgroundReview = {
  _id: string;
  author: ReviewAuthor;
  text: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type Campground = {
  _id: string;
  title: string;
  location: string;
  price: number;
  description: string;
  reviews: CampgroundReview[];
  images: CampgroundImage[];
  author: CampgroundAuthor;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  reviewCount?: number;
};

export type GetCampgroundsResponse = {
  success: boolean;
  message: string;
  data: Campground[];
};
export type GetCampgroundResponse = {
  success: boolean;
  message: string;
  data: Campground;
};
