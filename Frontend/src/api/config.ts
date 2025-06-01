import { Client, Avatars, Storage } from "appwrite";
// import fs from "fs";

export const appwriteConfig = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
};

export const apiConfig = {
  recommApiUrl: import.meta.env.VITE_RECOMMENDATION_API_URL,
  tomTomApiKey: import.meta.env.VITE_TOMTOM_API_KEY,
};

export const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const storage = new Storage(client);
export const avatars = new Avatars(client);

// async function listAllFileUrls(bucketId: string) {
//   let allFiles: string[] = [];
//   let lastFileId: string | undefined = undefined;
//   const limit = 100;

//   while (true) {
//     const queries = [Query.limit(limit)];
//     if (lastFileId) {
//       queries.push(Query.cursorAfter(lastFileId));
//     }

//     const result = await storage.listFiles(bucketId, queries);

//     const urls = result.files.map(
//       (file) => storage.getFileView(bucketId, file.$id).href
//     );
//     allFiles.push(...urls);

//     if (result.files.length < limit) break;

//     lastFileId = result.files[result.files.length - 1].$id;
//   }

//   // Download as .txt
//   const blob = new Blob([allFiles.join("\n")], { type: "text/plain" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = "file-urls.txt";
//   link.click();
// }

// // Replace with your bucket ID
// listAllFileUrls(appwriteConfig.storageId);
