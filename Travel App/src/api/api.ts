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
  MediaUrl,
} from "@/types";
import { appwriteConfig, account, avatars, storage, apiConfig } from "./config";

import axios from "axios";
import { extractAppwriteStorageFileIdFromUrl } from "@/lib/utils";

const API_BASE_URL = apiConfig.backendApiUrl;
const AI_API_BASE_URL = apiConfig.recommApiUrl;
const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

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

// utility

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
    const response = await axios.post(
      API_BASE_URL + "/users",
      {
        userID: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        username: user.username,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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
    const response = await axios.get(API_BASE_URL + `/users/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function createNormalPost(post: INewNormalPost) {
  try {
    const mainFiles = await processFiles(post.files);

    const response = await axios.post(
      API_BASE_URL + "/posts/normal",
      {
        userID: post.userId,
        caption: post.caption,
        body: post.body,
        location: post.location,
        tags: post.tags,
        files: mainFiles,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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
    if (post.deletedFiles.length > 0) {
      const deletedFiles = await Promise.all(
        post.deletedFiles.map(async (url) => {
          const id = extractAppwriteStorageFileIdFromUrl(url);
          try {
            if (!id) return { id, success: false };

            const deletionResult = await deleteFile(id);
            if (deletionResult?.status === "ok") return { id, success: true };
            return { id, success: false };
          } catch (error) {
            console.error(`Failed to delete file ${id}:`, error);
            return { id, success: false };
          }
        })
      );

      const allSuccessful = deletedFiles.every((file) => file.success);

      if (!allSuccessful) throw Error("Failed to delete files");
    }

    const response = await axios.put(
      API_BASE_URL + `/posts/normal/${post.postId}`,
      {
        caption: post.caption,
        body: post.body,
        location: post.location,
        tags: post.tags,
        newFiles: newFiles,
        deletedFiles: post.deletedFiles,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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

    const response = await axios.post(
      API_BASE_URL + "/posts/itinerary",
      {
        userID: post.userId,
        caption: post.caption,
        body: post.body,
        location: post.location,
        tags: post.tags,
        files: mainFiles,
        tripSteps: tripSteps,
        accommodations: post.accommodations,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function updateItineraryPost(post: IUpdateItineraryPost) {
  try {
    // delete files from appwrite if any
    if (post.toDeleteFromAppwrite.length > 0) {
      const deletedFiles = await Promise.all(
        post.toDeleteFromAppwrite.map(async (url) => {
          const id = extractAppwriteStorageFileIdFromUrl(url);
          try {
            if (!id) return { id, success: false };

            const deletionResult = await deleteFile(id);
            if (deletionResult?.status === "ok") return { id, success: true };
            return { id, success: false };
          } catch (error) {
            console.error(`Failed to delete file ${id}:`, error);
            return { id, success: false };
          }
        })
      );

      const allSuccessful = deletedFiles.every((file) => file.success);

      if (!allSuccessful) throw Error("Failed to delete files");
    }

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

    const response = await axios.put(
      API_BASE_URL + `/posts/itinerary/${post.postId}`,
      {
        caption: post.caption,
        body: post.body,
        location: post.location,
        tags: post.tags,
        files: basefilesToSendToBackend,
        tripSteps: tripStepsToSendToBackend,
        accommodations: post.accommodations,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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
    // delete files from appwrite if any
    if (toDeleteFromAppwrite.length > 0) {
      const deletedFiles = await Promise.all(
        toDeleteFromAppwrite.map(async (url) => {
          const id = extractAppwriteStorageFileIdFromUrl(url);
          try {
            if (!id) return { id, success: false };

            const deletionResult = await deleteFile(id);
            if (deletionResult?.status === "ok") return { id, success: true };
            return { id, success: false };
          } catch (error) {
            console.error(`Failed to delete file ${id}:`, error);
            return { id, success: false };
          }
        })
      );

      const allSuccessful = deletedFiles.every((file) => file.success);

      if (!allSuccessful) throw Error("Failed to delete files");
    }

    const response = await axios.delete(API_BASE_URL + `/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getRelatedItineraryMediaUrls(postId: string) {
  try {
    const response = await axios.get(
      API_BASE_URL + `/posts/${postId}/related-itinerary-media-urls`
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

export async function getRecentPosts() {
  try {
    const response = await axios.get(API_BASE_URL + "/posts/recent-posts");

    if (!response) throw Error;
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(userId: string, postId: string) {
  try {
    const response = await axios.post(API_BASE_URL + "/posts/like", {
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
    const response = await axios.delete(
      API_BASE_URL + `/posts/unlike/${userId}/${postId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(userId: string, postId: string) {
  try {
    const response = await axios.post(API_BASE_URL + "/posts/save", {
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
    const response = await axios.delete(
      API_BASE_URL + `/posts/unsave/${userId}/${postId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostLikedBy(postId: string) {
  try {
    const response = await axios.get(
      API_BASE_URL + `/posts/${postId}/liked-by`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostSavedBy(postId: string) {
  try {
    const response = await axios.get(
      API_BASE_URL + `/posts/${postId}/saved-by`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(
  postId: string
): Promise<IBasePost | undefined> {
  try {
    const response = await axios.get<IBasePost>(
      API_BASE_URL + `/posts/${postId}`
    );
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
    const response = await axios.get<{
      tripSteps: IDisplayedTripStep[];
      accommodations: IDisplayedAccommodation[];
    }>(API_BASE_URL + `/posts/${postId}/itinerary-details`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostLikeCount(postId: string) {
  try {
    const response = await axios.get(
      API_BASE_URL + `/posts/${postId}/like-count`
    );
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
    const response = await axios.get<IComment[]>(
      API_BASE_URL + `/comments/${postId}`
    );
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

    const response = await axios.post(API_BASE_URL + "/comments", commentData);
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

    const response = await axios.put(
      API_BASE_URL + `/comments/${commentId}`,
      editedCommentData
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteComment(commentId: string) {
  try {
    const response = await axios.delete(
      API_BASE_URL + `/comments/${commentId}`
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getCommentLikedBy(commentId: string) {
  try {
    const response = await axios.get(
      API_BASE_URL + `/comments/${commentId}/liked-by`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function likeComment(userId: string, commentId: string) {
  try {
    const response = await axios.post(API_BASE_URL + "/comments/like", {
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
    const response = await axios.delete(
      API_BASE_URL + `/comments/unlike/${userId}/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getCommentLikeCount(commentId: string) {
  try {
    const response = await axios.get(
      API_BASE_URL + `/comments/${commentId}/like-count`
    );
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

// AI
export async function getPostRecommendations(userId: number) {
  try {
    const response = await axios.get(
      AI_API_BASE_URL + `/getPostRecommendations/${userId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarUsers(userId: number) {
  try {
    const response = await axios.get(
      AI_API_BASE_URL + `/getSimilarUsers/${userId}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function evaluateHateSpeech(text: string) {
  try {
    const response = await axios.post(AI_API_BASE_URL + "/evaluateHateSpeech", {
      text: text,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}
