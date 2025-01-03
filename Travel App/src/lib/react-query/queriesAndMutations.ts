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
} from "../../api/api";
import {
  INewItineraryPost,
  INewNormalPost,
  INewUser,
  IUpdatePost,
} from "@/types";
import { QUERY_KEYS } from "./queryKeys";

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
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
    mutationFn: (post: INewNormalPost) => createNormalPost(post),
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
    mutationFn: (post: INewItineraryPost) => createNormalPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

// export const useUpdatePost = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (post: IUpdatePost) => updatePost(post),
//     onSuccess: (data) => {
//       // we practically get the data after the mutation finishes
//       queryClient.invalidateQueries({
//         queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
//       });
//     },
//   });
// };

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

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
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

export const useGetUserById = (userId: string) => {
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
