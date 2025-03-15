import { ID, ImageGravity } from "appwrite";

import {
  IBasePost,
  IComment,
  IDisplayedAccommodation,
  IDisplayedTripStep,
  INewItineraryPost,
  INewNormalPost,
  INewUser,
  IUpdateItineraryPost,
  IUpdateNormalPost,
  IUpdateUserProfile,
  MediaUrl,
} from "@/types";
import { appwriteConfig, account, avatars, storage, apiConfig } from "./config";

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

// ~~~~~~~~~~~~~~~~~~ SIGN IN & SIGN OUT with JWT Handling ~~~~~~~~~~~~~~~~~~
// Axios instance with base URL
// When you make a request using axios or fetch, and the withCredentials flag is enabled,
// the browser automatically includes the cookie in a header if the request's domain matches the cookie's domain
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

window.addEventListener("load", async () => {
  try {
    const storedSession = localStorage.getItem("cookieFallback");
    if (storedSession === "[]") {
      return; // Exit early if no stored session (avoids unnecessary request)
    }

    // Check if an active session exists
    const session = await account.getSession("current");

    if (!session) {
      return; // Exit early if no active session
    }

    const jwt = await account.createJWT();
    if (!jwt?.jwt) throw new Error("Failed to get JWT.");

    const payload = JSON.parse(atob(jwt.jwt.split(".")[1]));
    const exp = payload.exp * 1000;

    await apiClient.post("/auth/set-cookie", {
      token: jwt.jwt,
      expiration: exp,
    });

    setTimeout(refreshJWT, exp - Date.now() - 60000);
  } catch (error) {
    console.error("Auto-refresh JWT error:", error);
  }
});

async function refreshJWT() {
  try {
    console.log("Refreshing JWT...");
    const jwt = await account.createJWT();
    if (!jwt?.jwt) throw new Error("Failed to refresh JWT.");

    const payload = JSON.parse(atob(jwt.jwt.split(".")[1]));
    const exp = payload.exp * 1000;

    await apiClient.post("/auth/set-cookie", {
      token: jwt.jwt,
      expiration: exp,
    });

    setTimeout(refreshJWT, exp - Date.now() - 60000);
  } catch (error) {
    console.error("JWT refresh error:", error);
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    if (!session) throw new Error("Failed to create session.");

    const jwt = await account.createJWT();

    if (!jwt) throw new Error("Failed to create JWT.");

    const payload = JSON.parse(atob(jwt.jwt.split(".")[1]));
    const exp = payload.exp * 1000; // Convert expiration to milliseconds

    await apiClient.post("/auth/set-cookie", {
      token: jwt.jwt,
      expiration: exp,
    });

    setTimeout(refreshJWT, exp - Date.now() - 60000);

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    if (!session) throw Error;

    await apiClient.post("/auth/logout");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ~~~~~~~~~~~~~~~~~~ SIGN IN & SIGN OUT with JWT Handling ~~~~~~~~~~~~~~~~~~

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      id: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl.href,
    });

    if (!newUser) throw Error;

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDB(user: {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  username: string;
}) {
  try {
    const response = await apiClient.post("/users", {
      userID: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      username: user.username,
    });

    return response.data;
  } catch (error) {
    console.log(error, "error saving to DB");
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error("No authenticated user found.");

    const currentUser = await getUserById(currentAccount.$id);

    if (!currentUser) {
      throw new Error("No user found.");
    }

    return {
      id: currentAccount.$id,
      name: currentAccount.name || "",
      email: currentAccount.email,
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

export async function createNormalPost(post: INewNormalPost) {
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

export async function updateNormalPost(post: IUpdateNormalPost) {
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

export async function createItineraryPost(post: INewItineraryPost) {
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

export async function updateItineraryPost(post: IUpdateItineraryPost) {
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
    console.log("In delete post");

    const allFilesSuccessfullyDeleted = await deleteFilesFromAppwrite(
      toDeleteFromAppwrite
    );

    console.log("In delete post again");

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
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

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
): Promise<IBasePost | undefined> {
  try {
    const response = await apiClient.get<IBasePost>(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getItineraryDetails(postId: string): Promise<
  | {
      tripSteps: IDisplayedTripStep[];
      accommodations: IDisplayedAccommodation[];
    }
  | undefined
> {
  try {
    const response = await apiClient.get<{
      tripSteps: IDisplayedTripStep[];
      accommodations: IDisplayedAccommodation[];
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

export async function updateUser(profileInfo: IUpdateUserProfile) {
  try {
    const updateResponse = await account.updateName(profileInfo.name);

    if (!updateResponse) {
      throw new Error("Failed to update name in appwrite account");
    }

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
