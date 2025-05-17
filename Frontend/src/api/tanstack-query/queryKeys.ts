export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",
  GET_FOLLOWERS = "getFollowers",
  GET_FOLLOWING = "getFollowing",
  GET_IS_FOLLOWING = "getIsFollowing",
  GET_SIMILAR_USERS = "getSimilarUsers",

  // POST KEYS
  GET_POSTS = "getPosts",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_RECENT_POSTS = "getRecentPosts",
  GET_POST_BY_ID = "getPostById",
  GET_USER_POSTS = "getUserPosts",
  GET_FILE_PREVIEW = "getFilePreview",
  GET_POST_LIKED_BY = "getPostLikedBy",
  GET_POST_SAVED_BY = "getPostSavedBy",
  GET_LIKE_COUNT = "getLikeCount",
  GET_POST_COMMENTS = "getPostComments",
  GET_COMMENT_LIKED_BY = "getCommentLikedBy",
  GET_COMMENT_LIKE_COUNT = "getCommentLikeCount",
  GET_ITINERARY_DETAILS = "getItineraryDetails",
  GET_RELATED_ITINERARY_MEDIA_URLS = "getRelatedItineraryMediaUrls",
  GET_SIMILAR_POSTS = "getSimilarPosts",
  GET_SEARCH_POSTS = "getSearchPosts",

  // SEARCH KEYS
  SEARCH_POSTS = "getSearchPosts",
  GET_MAP_SEARCH_RESULTS = "getMapSearchResults",

  // ITINERARY GENERATOR KEYS
  GET_GENERATED_ITINERARY_BY_ID = "getGeneratedItineraryById",
  GET_GENERATED_ITINERARIES_FOR_USER = "getGeneratedItinerariesForUser",
}
