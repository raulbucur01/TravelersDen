import { type ClassValue, clsx } from "clsx";
import { Area } from "react-easy-crop";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

export const multiFormatDateString = (timestamp: string = ""): string => {
  const date: Date = new Date(timestamp);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(timestamp); // Fall back to formatted date
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) === 1:
      return `${Math.floor(diffInHours)} hour ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

/**
 * Utility function to format like counts into user-friendly strings.
 * Handles counts up to billions with K (thousand), M (million), and B (billion).
 * @param count - The number of likes.
 * @returns Formatted string for like counts.
 */
export const formatLikeCount = (count: number): string => {
  if (count < 0) return "0 Likes";

  if (count === 1) return "1 Like";
  if (count < 1000) return `${count} Likes`;

  if (count < 1_000_000) {
    // For counts between 1,000 and 999,999 (thousands)
    const formattedCount = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${formattedCount}k Likes`;
  }

  if (count < 1_000_000_000) {
    // For counts between 1 million and 999,999,999
    const formattedCount = (count / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${formattedCount}m Likes`;
  }

  // For counts over 1 billion
  const formattedCount = (count / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
  return `${formattedCount}b Likes`;
};

export const formatCommentCount = (count: number): string => {
  if (count < 0) return "0 Comments";

  if (count === 1) return "1 Comment";
  if (count < 1000) return `${count} Comments`;

  if (count < 1_000_000) {
    // For counts between 1,000 and 999,999 (thousands)
    const formattedCount = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${formattedCount}k Comments`;
  }

  if (count < 1_000_000_000) {
    // For counts between 1 million and 999,999,999
    const formattedCount = (count / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${formattedCount}m Comments`;
  }

  // For counts over 1 billion
  const formattedCount = (count / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
  return `${formattedCount}b Comments`;
};

export const getCroppedImg = async (imageSrc: string, crop: Area) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 1);
  });
};
