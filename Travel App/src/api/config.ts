import { Client, Account, Avatars, Storage } from "appwrite";

export const appwriteConfig = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
};

export const apiConfig = {
  backendApiUrl: import.meta.env.VITE_BACKEND_API_URL,
  recommApiUrl: import.meta.env.VITE_RECOMMENDATION_API_URL,
  tomTomApiKey: import.meta.env.VITE_TOMTOM_API_KEY,
};

export const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
