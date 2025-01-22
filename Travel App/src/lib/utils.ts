import { ISuggestionInfo } from "@/types";
import { type ClassValue, clsx } from "clsx";
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

/**
 * Returns a human-readable, relative time string based on the difference
 * between the current time and the given timestamp.
 *
 * Example:
 * - "5 minutes ago"
 * - "2 days ago"
 * - "Just now"
 *
 * @param {string} timestamp - The timestamp to compare with the current time.
 * @returns {string} A formatted relative time string.
 */
export const formatToRelativeDate = (timestamp: string = ""): string => {
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

export const formatMapSearchSuggestions = (
  results: any[]
): ISuggestionInfo[] => {
  return results
    .filter((item: any) => {
      // Keep only items with known types
      return ["POI", "Geography", "Street"].includes(item.type);
    })
    .map((item: any) => {
      const addressParts = [
        item.address?.streetName,
        item.address?.streetNumber,
        item.address?.municipality,
        item.address?.country,
      ];
      const address = addressParts.filter(Boolean).join(", ");

      switch (item.type) {
        case "POI":
          return {
            poiName: item.poi?.name,
            category: item.poi?.categories?.join(", "),
            address: address || item.address?.freeformAddress,
            latitude: item.position?.lat,
            longitude: item.position?.lon,
          };

        case "Geography":
          if (item.entityType === "Municipality") {
            return {
              poiName: item.address?.municipality,
              category: "Locality",
              address: item.address?.country,
              latitude: item.position?.lat,
              longitude: item.position?.lon,
            };
          }

          if (item.entityType === "MunicipalitySubdivision") {
            return {
              poiName: item.address?.municipality,
              category: "Locality",
              address: item.address?.country,
              latitude: item.position?.lat,
              longitude: item.position?.lon,
            };
          }

          if (item.entityType === "Country") {
            return {
              poiName: item.address?.country,
              category: "Country",
              address: "",
              latitude: item.position?.lat,
              longitude: item.position?.lon,
            };
          }

          if (item.entityType === "Neighbourhood") {
            return {
              poiName: item.address?.neighbourhood,
              category: "Neighbourhood",
              address: item.address?.freeformAddress,
              latitude: item.position?.lat,
              longitude: item.position?.lon,
            };
          }

          return {
            poiName: item.address?.country,
            category: "",
            address: item.address?.freeformAddress,
            latitude: item.position?.lat,
            longitude: item.position?.lon,
          };

        case "Street":
          return {
            poiName: item.address?.streetName,
            category: "Street",
            address: item.address?.freeformAddress,
            latitude: item.position?.lat,
            longitude: item.position?.lon,
          };

        default:
          return {
            poiName: "",
            category: "",
            address: "",
            latitude: 0,
            longitude: 0,
          };
      }
    });
};

/**
 * Formats a given date string into a full, human-readable date.
 *
 * Example:
 * - "21 January 2025"
 *
 * @param {string | null} dateString - The date string to format.
 * @returns {string} A formatted full date string.
 */
export const formatToLongDate = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString); // Convert the string to a Date object

  // Use Intl.DateTimeFormat to format the date
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

/**
 * Truncates a given text to a specified maximum length.
 * Adds an ellipsis ("...") if the text exceeds the maxLength.
 *
 * @param text - The text to truncate.
 * @param maxLength - The maximum length of the text. Defaults to 150.
 * @returns The truncated text.
 */
export const truncateText = (text: string, maxLength: number = 150): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
