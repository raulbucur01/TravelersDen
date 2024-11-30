import { ID, ImageGravity, Query } from "appwrite";

import { INewPost, INewUser, IUpdatePost } from "@/types";
import { appwriteConfig, account, avatars, storage } from "./config";
import { userInfo } from "os";

import axios, { AxiosResponse } from "axios";

interface Post {
  content: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const API_BASE_URL = "https://localhost:7007";

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
      API_BASE_URL + "/users/createUser",
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

export async function getUserById(id: string) {
  try {
    console.log("Entered get user by id");
    const response = await axios.get(API_BASE_URL + `/users/getUserById/${id}`);

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

export async function createPost(post: INewPost) {
  try {
    const uploadedFiles: any[] = [];
    const fileData: { url: string; type: string }[] = [];

    // Use map instead of forEach for async operations
    const filePromises = post.files.map(async (file) => {
      const uploadedFile = await uploadFile(file);

      if (!uploadedFile) throw new Error("File upload failed");

      uploadedFiles.push(uploadedFile);

      // Get the preview URL if the file is an image
      let fileUrl = null;
      if (file.type.startsWith("image/")) {
        fileUrl = getFilePreview(uploadedFile.$id);
      } else if (file.type.startsWith("video/")) {
        // For videos, just use the file URL directly
        fileUrl = storage.getFileView(
          appwriteConfig.storageId,
          uploadedFile.$id
        );
      }

      if (!fileUrl) {
        // Clean up previously uploaded files if one fails
        await Promise.all(
          uploadedFiles.map(async (uploaded) => {
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
      fileData.push({ url: fileUrl.href, type: fileType });
    });

    // Wait for all the file operations to complete
    await Promise.all(filePromises);

    const sentData = {
      userID: post.userId,
      caption: post.caption,
      body: post.body,
      location: post.location,
      tags: post.tags,
      files: fileData,
    };

    console.log(sentData);
    const response = await axios.post(
      API_BASE_URL + "/posts/createPost",
      {
        userID: post.userId,
        caption: post.caption,
        body: post.body,
        location: post.location,
        tags: post.tags,
        files: fileData,
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

export async function updatePost(post: IUpdatePost) {
  try {
    return;
  } catch (error) {
    console.log(error);
  }
}
