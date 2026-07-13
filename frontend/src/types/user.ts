export type User = {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  imageUrl: string;
};

export type GetMeResponse = {
  success: boolean;
  user: User;
};
