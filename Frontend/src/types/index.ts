export type ContextType = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

export type NavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type UpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type NewNormalPost = {
  userId: string;
  caption: string;
  body: string;
  files: File[];
  location?: string;
  tags?: string;
};

export type NewItineraryPost = {
  userId: string;
  caption: string;
  body: string;
  files: File[];
  location?: string;
  tags?: string;
  tripSteps: TripStep[];
  accommodations: Accommodation[];
};

export type TripStep = {
  stepNumber: number;
  latitude: number;
  longitude: number;
  zoom: number;
  price: number;
  description: string;
  files: File[];
};

export type Accommodation = {
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

export type UpdateNormalPost = {
  postId: string;
  caption: string;
  body: string;
  location: string;
  tags: string;
  newFiles: File[];
  deletedFiles: string[];
};

export type UpdateItineraryPost = {
  postId: string;
  caption: string;
  body: string;
  location: string;
  tags: string;
  files: (File | MediaUrl)[];
  tripSteps: TripStep[];
  accommodations: Accommodation[];
  toDeleteFromAppwrite: string[];
};

export type User = {
  userId: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type BasePost = {
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

export type ItineraryPost = {
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

  tripSteps: TripStep[];
  accommodations: Accommodation[];
};

export type DisplayedTripStep = {
  tripStepId: string;
  stepNumber: number;
  latitude: number;
  longitude: number;
  zoom: number;
  price: number;
  description: string;
  mediaUrls: { url: string; type: string }[];
};

export type DisplayedAccommodation = {
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

export type NewUser = {
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
  type: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
}

export type UpdateUserProfile = {
  userId: string;
  name: string;
  username: string;
  bio: string;
  updatedImageFile: File | null;
  previousImageUrl: string;
};

export type MediaUrl = {
  url: string;
  type: string;
};

export type TravelMode = "car" | "pedestrian" | "bus" | "bicycle";

export type ProfileGridPost = {
  postId: string;
  firstMediaUrl: string;
  isItinerary: boolean;
};

export type ProfileGridPostResponse = {
  posts: ProfileGridPost[];
  hasMore: boolean;
};

export type GenerateItineraryRequest = {
  destination: string;
  days: number;
  preferences: string[];
  userId: string;
};

export type NewGeneratedItineraryResponse = {
  itineraryId: string;
};

export type GeneratedItinerary = {
  itineraryId: string;
  userId: string;
  destination: string;
  createdAt: string;
  days: ItineraryDay[];
};

export type ItineraryDay = {
  dayId?: string; // for frontend use
  day: number;
  activities: ItineraryActivity[];
};

export type ItineraryActivity = {
  activityId?: string; // for frontend use
  title: string;
  description: string;
  location: string;
};
