export type IContextType = {
  user: IUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewNormalPost = {
  userId: string;
  caption: string;
  body: string;
  files: File[];
  location?: string;
  tags?: string;
};

export type INewItineraryPost = {
  userId: string;
  caption: string;
  body: string;
  files: File[];
  location?: string;
  tags?: string;
  tripSteps: ITripStep[];
  accommodations: IAccommodation[];
};

export type ITripStep = {
  stepNumber: number;
  latitude: number;
  longitude: number;
  price: number;
  description: string;
  files: File[];
};

export type IAccommodation = {
  name: string;
  description: string;
  // latitude: number;
  // longitude: number;
  startDate: string | null;
  endDate: string | null;
  pricePerNight: number;
  totalPrice: number;
  link: string;
};

export type IUpdateNormalPost = {
  postId: string;
  caption: string;
  body: string;
  location: string;
  tags: string;
  newFiles: File[];
  deletedFiles: string[];
};

export type IUpdateItineraryPost = {
  postId: string;
  caption: string;
  body: string;
  location: string;
  tags: string;
  newFiles: File[];
  deletedFiles: string[];
  tripSteps: ITripStep[];
  accommodations: IAccommodation[];
  newTripStepFiles: { [key: string]: File[] };
  deletedTripStepFiles: { [key: string]: string[] };
};

export type IUser = {
  userId: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type IBasePost = {
  postId: string;
  userId: string;
  caption: string;
  body: string;
  mediaUrls: { url: string; type: string }[];
  location?: string;
  tags?: string;
  createdAt: string;
  likesCount: number;
  isItinerary: boolean;
};

export type IItineraryPost = {
  postId: string;
  userId: string;
  caption: string;
  body: string;
  mediaUrls: { url: string; type: string }[];
  location?: string;
  tags?: string;
  createdAt: string;
  likesCount: number;
  isItinerary: boolean;

  tripSteps: ITripStep[];
  accommodations: IAccommodation[];
};

export type IDisplayedTripStep = {
  tripStepId: string;
  stepNumber: number;
  latitude: number;
  longitude: number;
  price: number;
  description: string;
  mediaUrls: { url: string; type: string }[];
};

export type IDisplayedAccommodation = {
  name: string;
  description: string;
  // latitude: number;
  // longitude: number;
  startDate: string | null;
  endDate: string | null;
  pricePerNight: number;
  totalPrice: number;
  link: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export interface ICommentCreator {
  userId: string;
  username: string;
  imageUrl: string;
  name: string;
}

export interface ICommentReply {
  commentId: string;
  postId: string;
  parentCommentId: string;
  mention: string;
  mentionedUserId: string;
  body: string;
  createdAt: string;
  likesCount: number;
  user: ICommentCreator;
}

export interface IComment {
  commentId: string;
  postId: string;
  mention: string;
  mentionedUserId: string;
  body: string;
  createdAt: string;
  likesCount: number;
  user: ICommentCreator;
  replies: ICommentReply[];
}

export interface ISuggestionInfo {
  poiName: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
}
