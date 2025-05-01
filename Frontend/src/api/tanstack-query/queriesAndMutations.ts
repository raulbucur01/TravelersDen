import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  createUserAccount,
  getCurrentUser,
  signInAccount,
  signOutAccount,
  createNormalPost,
  createItineraryPost,
  likePost,
  unsavePost,
  savePost,
  getUserById,
  getRecentPosts,
  getPostLikedBy,
  unlikePost,
  getPostSavedBy,
  getPostById,
  getPostLikeCount,
  getCommentsForPost,
  createComment,
  deleteComment,
  editComment,
  getCommentLikedBy,
  likeComment,
  unlikeComment,
  getCommentLikeCount,
  getMapSearchResults,
  getItineraryDetails,
  updateNormalPost,
  updateItineraryPost,
  deletePost,
  getRelatedItineraryMediaUrls,
  getSimilarPosts,
  getFollowers,
  getFollowing,
  follow,
  unfollow,
  IsFollowing,
  updateUser,
  getUserPosts,
  searchPosts,
  generateNewItinerary,
} from "../api";
import {
  NewItineraryPost,
  NewNormalPost,
  NewUser,
  UpdateUserProfile,
  UpdateItineraryPost,
  UpdateNormalPost,
  GenerateItineraryRequest,
} from "@/types";
import { QUERY_KEYS } from "./queryKeys";

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: NewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useCreateNormalPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: NewNormalPost) => createNormalPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useCreateItineraryPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: NewItineraryPost) => createItineraryPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useUpdateNormalPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: UpdateNormalPost) => updateNormalPost(post),
    onSuccess: async (data) => {
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.postId],
      });
    },
  });
};

export const useUpdateItineraryPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: UpdateItineraryPost) => updateItineraryPost(post),
    onSuccess: async (data) => {
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.postId],
      });
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_ITINERARY_DETAILS, data.postId],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      toDeleteFromAppwrite,
    }: {
      postId: string;
      toDeleteFromAppwrite: string[];
    }) => deletePost(postId, toDeleteFromAppwrite),

    onMutate: async ({ postId }) => {
      // Cancel outgoing queries to avoid race conditions
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });

      // Get previous cache data
      const previousPosts = queryClient.getQueryData([
        QUERY_KEYS.GET_RECENT_POSTS,
      ]);

      // Optimistically update the UI
      queryClient.setQueryData(
        [QUERY_KEYS.GET_RECENT_POSTS],
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              posts: page.posts.filter((post: any) => post.postId !== postId),
            })),
          };
        }
      );

      return { previousPosts }; // Store old cache in case we need to rollback
    },

    onError: (_error, _, context) => {
      // Rollback if the mutation fails
      if (context?.previousPosts) {
        queryClient.setQueryData(
          [QUERY_KEYS.GET_RECENT_POSTS],
          context.previousPosts
        );
      }
    },

    onSettled: async () => {
      // Ensure the latest data is fetched
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetRelatedItineraryMediaUrls = (
  postId: string,
  enabledFlag: boolean
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RELATED_ITINERARY_MEDIA_URLS, postId],
    queryFn: () => getRelatedItineraryMediaUrls(postId),
    enabled: enabledFlag,
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      likePost(userId, postId),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_LIKED_BY, data.postId],
      });
      // queryClient.refetchQueries({
      //   queryKey: [QUERY_KEYS.GET_POST_SAVED_BY, data.postId],
      // });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.postId],
      });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      unlikePost(userId, postId),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_LIKED_BY, data.postId],
      });
      // queryClient.refetchQueries({
      //   queryKey: [QUERY_KEYS.GET_POST_SAVED_BY, data.postId],
      // });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.postId],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      // queryClient.refetchQueries({
      //   queryKey: [QUERY_KEYS.GET_POST_LIKED_BY, data.postId],
      // });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_SAVED_BY, data.postId],
      });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.postId],
      });
    },
  });
};

export const useUnsavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      unsavePost(userId, postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      // queryClient.refetchQueries({
      //   queryKey: [QUERY_KEYS.GET_POST_LIKED_BY, data.postId],
      // });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_SAVED_BY, data.postId],
      });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.postId],
      });
    },
  });
};

// The first time this runs, React Query automatically passes pageParam = 1.
// Then, when a new page is needed, pageParam updates dynamically.
// When user scrolls down, fetchNextPage() is called.
// React Query calls getNextPageParam(lastPage, allPages).
// If it returns a new page number, React Query fetches more data.
// It appends the new data to data.pages.
// If hasMore === false, pagination stops.
// fetchNextPage() will not request new data.
export const useGetRecentPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    // React Query automatically calls the queryFn with an object containing pageParam,
    // so the function signature needs to match:
    queryFn: ({ pageParam = 1 }) => getRecentPosts({ pageParam }),
    initialPageParam: 1, // It sets the first page number. React Query uses this as the starting pageParam.

    // It tells React Query how to determine the next page number.
    // The function receives two arguments:
    // lastPage → Data returned from the last API call.
    // allPages → An array of all previously fetched pages.
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
};

export const useGetSimilarPosts = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SIMILAR_POSTS, postId],
    queryFn: () => getSimilarPosts(postId),
  });
};

export const useGetItineraryDetails = (
  postId: string,
  enabledFlag: boolean = true // used at editing post to fetch the itinerary details only in Update mode
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ITINERARY_DETAILS, postId],
    queryFn: () => getItineraryDetails(postId),
    enabled: !!postId && enabledFlag,
  });
};

export const useGetPostLikedBy = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_LIKED_BY, postId],
    queryFn: () => getPostLikedBy(postId),
  });
};

export const useGetPostSavedBy = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_SAVED_BY, postId],
    queryFn: () => getPostSavedBy(postId),
  });
};

export const useGetUserById = (userId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetPostLikeCount = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LIKE_COUNT, postId],
    queryFn: () => getPostLikeCount(postId),
    enabled: !!postId,
  });
};

export const useGetCommentsForPost = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_COMMENTS, postId],
    queryFn: () => getCommentsForPost(postId),
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentData: {
      userId: string;
      postId: string;
      body: string;
      parentCommentId?: string | null;
      mention?: string | null;
      mentionedUserId?: string | null;
    }) => createComment(commentData),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, data.postId],
      });
    },
  });
};

export const useEditComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (editedCommentData: {
      commentId: string;
      body: string;
      mention?: string | null;
      mentionedUserId?: string | null;
    }) => editComment(editedCommentData),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, data.postId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, data.postId],
      });
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      commentId,
    }: {
      userId: string;
      commentId: string;
    }) => likeComment(userId, commentId),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_COMMENT_LIKED_BY, data.commentId],
      });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_COMMENT_LIKE_COUNT, data.commentId],
      });
    },
  });
};

export const useUnlikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      commentId,
    }: {
      userId: string;
      commentId: string;
    }) => unlikeComment(userId, commentId),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_COMMENT_LIKED_BY, data.commentId],
      });
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_COMMENT_LIKE_COUNT, data.commentId],
      });
    },
  });
};

export const useGetCommentLikedBy = (commentId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COMMENT_LIKED_BY, commentId],
    queryFn: () => getCommentLikedBy(commentId),
  });
};

export const useGetCommentLikeCount = (commentId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COMMENT_LIKE_COUNT, commentId],
    queryFn: () => getCommentLikeCount(commentId),
    enabled: !!commentId,
  });
};

export const useGetMapSearchResults = (query: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MAP_SEARCH_RESULTS, query],
    queryFn: () => getMapSearchResults(query),
    enabled: false,
  });
};

export const useGetUserConnections = (
  userId: string,
  type: "followers" | "following",
  enabled: boolean
) => {
  return type === "followers"
    ? useGetFollowers(userId, enabled)
    : useGetFollowing(userId, enabled);
};

export const useGetFollowers = (userId: string, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWERS, userId],
    queryFn: ({ pageParam = 1 }) => getFollowers({ userId, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled,
  });
};

export const useGetFollowing = (userId: string, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING, userId],
    queryFn: ({ pageParam = 1 }) => getFollowing({ userId, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled,
  });
};

export const useGetUserPosts = (userId: string) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: ({ pageParam = 1 }) => getUserPosts({ userId, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
};

export const useFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userIdFollowing,
      userIdFollowed,
    }: {
      userIdFollowing: string;
      userIdFollowed: string;
    }) => follow(userIdFollowing, userIdFollowed),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING, data.userIdFollowing],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS, data.userIdFollowed],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data.userIdFollowing],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data.userIdFollowed],
      });
    },
  });
};

export const useUnfollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userIdUnfollowing,
      userIdFollowed,
    }: {
      userIdUnfollowing: string;
      userIdFollowed: string;
    }) => unfollow(userIdUnfollowing, userIdFollowed),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING, data.userIdUnfollowing],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS, data.userIdFollowed],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data.userIdUnfollowing],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data.userIdFollowed],
      });
    },
  });
};

export const useIsFollowing = (userId1: string, userId2: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_IS_FOLLOWING, userId1, userId2],
    queryFn: () => IsFollowing(userId1, userId2),
    enabled: !!userId1 && !!userId2, // Ensures query runs only when both user IDs are provided
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileInfo: UpdateUserProfile) => updateUser(profileInfo),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data.userId],
      });
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_SEARCH_POSTS, searchTerm],
    queryFn: ({ pageParam = 1 }) => searchPosts({ searchTerm, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!searchTerm,
  });
};

// used to create and get a fresh generated itinerary
export const useGenerateNewItinerary = () => {
  return useMutation({
    mutationFn: (generateItineraryRequest: GenerateItineraryRequest) =>
      generateNewItinerary(generateItineraryRequest),
  });
};
