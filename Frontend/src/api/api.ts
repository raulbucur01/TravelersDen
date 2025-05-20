import { ID } from "appwrite";

import {
  BasePost,
  IComment,
  DisplayedAccommodation,
  DisplayedTripStep,
  GenerateItineraryRequest,
  NewItineraryPost,
  NewNormalPost,
  NewUser,
  ProfileGridPostResponse,
  UpdateItineraryPost,
  UpdateNormalPost,
  UpdateUserProfile,
  MediaUrl,
  GeneratedItinerary,
  NewGeneratedItineraryResponse,
  ItineraryActivity,
  RegenerateDayActivitiesRequest,
  SimilarUser,
} from "@/types";
import { appwriteConfig, avatars, storage, apiConfig } from "./config";

import axios from "axios";
import { extractAppwriteStorageFileIdFromUrl } from "@/lib/utils";

const API_BASE_URL = apiConfig.backendApiUrl;
const TOMTOM_API_KEY = apiConfig.tomTomApiKey;

// utility
export const processFiles = async (files: File[]) => {
  const results: { url: string; type: string }[] = [];
  const uploaded: any[] = [];

  // Use map instead of forEach for async operations
  const filePromises = files.map(async (file) => {
    const uploadedFile = await uploadFile(file);

    if (!uploadedFile) throw new Error("File upload failed");

    uploaded.push(uploadedFile);

    // Get the preview URL if the file is an image
    let fileUrl = null;
    if (file.type.startsWith("image/")) {
      fileUrl = getFilePreview(uploadedFile.$id);
    } else if (file.type.startsWith("video/")) {
      // For videos, just use the file URL directly
      fileUrl = storage.getFileView(appwriteConfig.storageId, uploadedFile.$id);
    }

    if (!fileUrl) {
      // Clean up previously uploaded files if one fails
      await Promise.all(
        uploaded.map(async (uploaded) => {
          await deleteFile(uploaded.$id);
        })
      );
      throw new Error("Failed to get file preview URL");
    }

    // Determine file type based on MIME type (photo or video)
    const fileType = file.type.startsWith("image/")
      ? "Photo"
      : file.type.startsWith("video/")
      ? "Video"
      : "Unknown";

    // Store both URL and type in a single object
    results.push({ url: fileUrl.href, type: fileType });
  });

  // Wait for all the file operations to complete
  await Promise.all(filePromises);
  return results;
};

async function processPostFilesForUpdate(
  postFiles: (MediaUrl | File)[]
): Promise<MediaUrl[]> {
  // Check if all files are already in the correct format
  const allFilesAreMediaUrls = postFiles.every(
    (item) => "url" in item && "type" in item
  );

  if (allFilesAreMediaUrls) {
    return postFiles as MediaUrl[];
  }

  let formattedMediaFiles = postFiles.filter(
    (item) => "url" in item && "type" in item
  ) as MediaUrl[];

  // Identify files that need to be processed
  const unformattedMediaFiles = postFiles.filter(
    (item) => !("url" in item && "type" in item)
  ) as File[];

  const newFiles = await processFiles(unformattedMediaFiles);

  if (!newFiles) throw new Error("Failed to process new files");

  formattedMediaFiles = [...formattedMediaFiles, ...(newFiles as MediaUrl[])];

  return formattedMediaFiles;
}

async function deleteFilesFromAppwrite(fileUrls: string[]): Promise<boolean> {
  if (fileUrls.length === 0) return true; // No files to delete

  const deletedFiles = await Promise.all(
    fileUrls.map(async (url) => {
      const id = extractAppwriteStorageFileIdFromUrl(url);
      try {
        if (!id) return { id, success: false };

        const deletionResult = await deleteFile(id);
        return { id, success: deletionResult?.status === "ok" };
      } catch (error) {
        console.error(`Failed to delete file ${id}:`, error);
        return { id, success: false };
      }
    })
  );

  return deletedFiles.every((file) => file.success);
}
// utility

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function signIn(user: { email: string; password: string }) {
  try {
    const response = await apiClient.post("/auth/login", user);

    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function signOut() {
  try {
    const response = await apiClient.post("/auth/logout");

    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function register(user: NewUser) {
  try {
    const avatarUrl = avatars.getInitials(user.name);

    const newUser = {
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password,
      imageUrl: avatarUrl.href,
    };

    const response = await apiClient.post("/auth/register", newUser);

    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get("/auth/current-user");

    if (!response) throw new Error("Failed to fetch current user.");

    const currentUserId = response.data.userId;

    const currentUser = await getUserById(currentUserId);

    if (!currentUser) {
      throw new Error("No user found.");
    }

    return {
      userId: currentUser.userId,
      name: currentUser.name || "",
      email: currentUser.email,
      username: currentUser.username,
      imageUrl: currentUser.imageUrl || "",
      bio: "",
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function getUserById(id: string | undefined) {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createNormalPost(post: NewNormalPost) {
  try {
    const mainFiles = await processFiles(post.files);

    const response = await apiClient.post("/posts/normal", {
      userID: post.userId,
      caption: post.caption,
      body: post.body,
      location: post.location,
      tags: post.tags,
      files: mainFiles,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function updateNormalPost(post: UpdateNormalPost) {
  try {
    let newFiles: { url: string; type: string }[] = [];
    // add the new files to appwrite if any
    if (post.newFiles.length > 0) {
      newFiles = await processFiles(post.newFiles);

      if (!newFiles) throw Error("Failed to process new files");
    }

    // delete files from appwrite if any
    const allFilesSuccessfullyDeleted = await deleteFilesFromAppwrite(
      post.deletedFiles
    );

    if (!allFilesSuccessfullyDeleted) throw Error("Failed to delete files");

    const response = await apiClient.put(`/posts/normal/${post.postId}`, {
      caption: post.caption,
      body: post.body,
      location: post.location,
      tags: post.tags,
      newFiles: newFiles,
      deletedFiles: post.deletedFiles,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function createItineraryPost(post: NewItineraryPost) {
  try {
    const mainFiles = await processFiles(post.files);

    const tripSteps = await Promise.all(
      post.tripSteps.map(async (step) => {
        const stepFiles = await processFiles(step.files);
        return {
          ...step,
          files: stepFiles,
        };
      })
    );

    const response = await apiClient.post("/posts/itinerary", {
      userID: post.userId,
      caption: post.caption,
      body: post.body,
      location: post.location,
      tags: post.tags,
      files: mainFiles,
      tripSteps: tripSteps,
      accommodations: post.accommodations,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function updateItineraryPost(post: UpdateItineraryPost) {
  try {
    // delete files from appwrite if any
    const allFilesSuccessfullyDeleted = await deleteFilesFromAppwrite(
      post.toDeleteFromAppwrite
    );

    if (!allFilesSuccessfullyDeleted) throw Error("Failed to delete files");

    // add the new files to appwrite if needed
    const basefilesToSendToBackend = await processPostFilesForUpdate(
      post.files
    );

    // add the new trip step files to appwrite if any
    const tripStepsToSendToBackend = [];
    for (let item of post.tripSteps) {
      const tripStepFilesToSendToBackend = await processPostFilesForUpdate(
        item.files
      );

      tripStepsToSendToBackend.push({
        ...item,
        files: tripStepFilesToSendToBackend,
      });
    }

    const response = await apiClient.put(`/posts/itinerary/${post.postId}`, {
      caption: post.caption,
      body: post.body,
      location: post.location,
      tags: post.tags,
      files: basefilesToSendToBackend,
      tripSteps: tripStepsToSendToBackend,
      accommodations: post.accommodations,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(
  postId: string,
  toDeleteFromAppwrite: string[]
) {
  try {
    const allFilesSuccessfullyDeleted = await deleteFilesFromAppwrite(
      toDeleteFromAppwrite
    );

    if (!allFilesSuccessfullyDeleted) throw Error("Failed to delete files");

    const response = await apiClient.delete(`/posts/${postId}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getRelatedItineraryMediaUrls(postId: string) {
  try {
    const response = await apiClient.get(
      `/posts/${postId}/related-itinerary-media-urls`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string) {
  try {
    // can no longer use this method as it is now a paid feature (need to get the raw url)
    // const fileUrl = storage.getFilePreview(
    //   appwriteConfig.storageId,
    //   fileId,
    //   2000,
    //   2000,
    //   ImageGravity.Top,
    //   100
    // );
    const fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarPosts(postId: string) {
  try {
    const response = await apiClient.get(`/posts/${postId}/similar-posts`);

    if (!response) throw Error;

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts({ pageParam = 1 }) {
  try {
    const response = await apiClient.get("/posts/recent-posts", {
      params: {
        page: pageParam,
        pageSize: 10,
      },
    });

    if (!response) throw Error;

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(userId: string, postId: string) {
  try {
    const response = await apiClient.post("/posts/like", {
      userId: userId,
      postId: postId,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function unlikePost(userId: string, postId: string) {
  try {
    const response = await apiClient.delete(
      `/posts/unlike/${userId}/${postId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(userId: string, postId: string) {
  try {
    const response = await apiClient.post("/posts/save", {
      userId: userId,
      postId: postId,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function unsavePost(userId: string, postId: string) {
  try {
    const response = await apiClient.delete(
      `/posts/unsave/${userId}/${postId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostLikedBy(postId: string) {
  try {
    const response = await apiClient.get(`/posts/${postId}/liked-by`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostSavedBy(postId: string) {
  try {
    const response = await apiClient.get(`/posts/${postId}/saved-by`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(
  postId: string
): Promise<BasePost | undefined> {
  try {
    const response = await apiClient.get<BasePost>(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getItineraryDetails(postId: string): Promise<
  | {
      tripSteps: DisplayedTripStep[];
      accommodations: DisplayedAccommodation[];
    }
  | undefined
> {
  try {
    const response = await apiClient.get<{
      tripSteps: DisplayedTripStep[];
      accommodations: DisplayedAccommodation[];
    }>(`/posts/${postId}/itinerary-details`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostLikeCount(postId: string) {
  try {
    const response = await apiClient.get(`/posts/${postId}/like-count`);
    return response?.data?.likesCount ?? 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

export async function getCommentsForPost(
  postId: string
): Promise<IComment[] | []> {
  try {
    const response = await apiClient.get<IComment[]>(`/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function createComment({
  userId,
  postId,
  body,
  parentCommentId,
  mention,
  mentionedUserId,
}: {
  userId: string;
  postId: string;
  body: string;
  parentCommentId?: string | null;
  mention?: string | null;
  mentionedUserId?: string | null;
}) {
  try {
    const commentData = {
      userId: userId,
      postId: postId,
      body: body,
      parentCommentId: parentCommentId || null,
      mention: mention || null, // Default to null if mention is not provided
      mentionedUserId: mentionedUserId || null,
    };

    const response = await apiClient.post("/comments", commentData);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function editComment({
  commentId,
  body,
  mention,
  mentionedUserId,
}: {
  commentId: string;
  body: string;
  mention?: string | null;
  mentionedUserId?: string | null;
}) {
  try {
    const editedCommentData = {
      body: body,
      mention: mention || null,
      mentionedUserId: mentionedUserId || null,
    };

    const response = await apiClient.put(
      `/comments/${commentId}`,
      editedCommentData
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteComment(commentId: string) {
  try {
    const response = await apiClient.delete(`/comments/${commentId}`);

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getCommentLikedBy(commentId: string) {
  try {
    const response = await apiClient.get(`/comments/${commentId}/liked-by`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function likeComment(userId: string, commentId: string) {
  try {
    const response = await apiClient.post("/comments/like", {
      userId: userId,
      commentId: commentId,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function unlikeComment(userId: string, commentId: string) {
  try {
    const response = await apiClient.delete(
      `/comments/unlike/${userId}/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getCommentLikeCount(commentId: string) {
  try {
    const response = await apiClient.get(`/comments/${commentId}/like-count`);
    return response?.data?.likesCount ?? 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

export async function getMapSearchResults(query: string) {
  try {
    const response = await axios.get(
      `https://api.tomtom.com/search/2/search/${query}.json?key=${TOMTOM_API_KEY}&limit=${5}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(userId: string) {
  try {
    const response = await apiClient.delete(`/users/${userId}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(profileInfo: UpdateUserProfile) {
  try {
    let imageUrl = profileInfo.previousImageUrl; // Default to current image URL

    // CASE 1: No new image & previous image was an initials avatar -> Generate new initials avatar
    if (
      !profileInfo.updatedImageFile &&
      profileInfo.previousImageUrl.includes("avatar")
    ) {
      const avatarUrl = avatars.getInitials(profileInfo.name);

      if (!avatarUrl) throw new Error("Failed to generate avatar URL");

      imageUrl = avatarUrl.href;
    }

    // CASE 2: New image selected
    if (profileInfo.updatedImageFile) {
      // If previous image was NOT an avatar, delete it first
      if (!profileInfo.previousImageUrl.includes("avatar")) {
        const id = extractAppwriteStorageFileIdFromUrl(
          profileInfo.previousImageUrl
        );

        if (!id) throw new Error("Failed to extract file id from URL");

        const deletionResult = await deleteFile(id);

        if (!deletionResult)
          throw new Error("Failed to delete file from Appwrite");
      }

      // Upload new image
      const uploadedFile = await uploadFile(profileInfo.updatedImageFile);

      if (!uploadedFile) throw new Error("Failed to upload file to Appwrite");

      imageUrl = getFilePreview(uploadedFile.$id)?.href ?? "";
    }

    const response = await apiClient.put(`/users/${profileInfo.userId}`, {
      name: profileInfo.name,
      username: profileInfo.username,
      bio: profileInfo.bio,
      imageUrl,
    });

    if (!response) throw new Error("Failed to update user");

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function follow(userIdFollowing: string, userIdFollowed: string) {
  try {
    const response = await apiClient.post("/users/follow", {
      userIdFollowing: userIdFollowing,
      userIdFollowed: userIdFollowed,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function unfollow(
  userIdUnfollowing: string,
  userIdFollowed: string
) {
  try {
    const response = await apiClient.delete(
      `/users/unfollow/${userIdUnfollowing}/${userIdFollowed}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getFollowers({
  userId,
  pageParam = 1,
}: {
  userId: string;
  pageParam?: number;
}) {
  try {
    const response = await apiClient.get(`/users/${userId}/followers`, {
      params: {
        page: pageParam,
        pageSize: 10,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getFollowing({
  userId,
  pageParam = 1,
}: {
  userId: string;
  pageParam?: number;
}) {
  try {
    const response = await apiClient.get(`/users/${userId}/following`, {
      params: {
        page: pageParam,
        pageSize: 10,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserPosts({
  userId,
  pageParam = 1,
}: {
  userId: string;
  pageParam?: number;
}): Promise<ProfileGridPostResponse> {
  try {
    const response = await apiClient.get<ProfileGridPostResponse>(
      `/users/${userId}/posts`,
      {
        params: {
          page: pageParam,
          pageSize: 10,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function IsFollowing(userId1: string, userId2: string) {
  try {
    const response = await apiClient.get(
      `/users/${userId1}/is-following/${userId2}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function searchPosts({
  searchTerm,
  pageParam = 1,
}: {
  searchTerm: string;
  pageParam?: number;
}) {
  try {
    const response = await apiClient.get(`/posts/search`, {
      params: {
        searchTerm,
        page: pageParam,
        pageSize: 10,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

// generate new itinerary
export async function generateNewItinerary(
  generateItineraryRequest: GenerateItineraryRequest
): Promise<NewGeneratedItineraryResponse | undefined> {
  try {
    const response = await apiClient.post<NewGeneratedItineraryResponse>(
      `/itinerary-generator/generate-itinerary`,
      generateItineraryRequest
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

// get user's generated itineraries
export async function getGeneratedItinerariesForUser(
  userId: string
): Promise<GeneratedItinerary[] | undefined> {
  try {
    const response = await apiClient.get<GeneratedItinerary[]>(
      `/itinerary-generator/generated-itineraries/by-user/${userId}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteGeneratedItinerary(itineraryId: string) {
  try {
    const response = await apiClient.delete(
      `/itinerary-generator/generated-itineraries/${itineraryId}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getGeneratedItineraryById(
  itineraryId: string
): Promise<GeneratedItinerary | undefined> {
  try {
    const response = await apiClient.get<GeneratedItinerary>(
      `/itinerary-generator/generated-itineraries/by-id/${itineraryId}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function regenerateDayActivities(
  regenerateDayActivitiesRequest: RegenerateDayActivitiesRequest
): Promise<ItineraryActivity[] | undefined> {
  try {
    const response = await apiClient.post<ItineraryActivity[]>(
      "/itinerary-generator/regenerate-day-activities",
      regenerateDayActivitiesRequest
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function saveGeneratedItineraryChanges(
  itinerary: GeneratedItinerary
) {
  try {
    const response = await apiClient.put(
      `/itinerary-generator/generated-itineraries`,
      itinerary
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

// user recomendations
export async function getSimilarUsers(
  userId: string
): Promise<SimilarUser[] | undefined> {
  try {
    const response = await apiClient.get<SimilarUser[]>(
      `/users/${userId}/similar-users`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}
