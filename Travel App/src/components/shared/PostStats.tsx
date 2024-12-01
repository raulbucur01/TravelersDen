import {
  useUnsavePost,
  useGetCurrentUser,
  useGetPostLikedBy,
  useGetPostSavedBy,
  useLikePost,
  useUnlikePost,
  useSavePost,
} from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import { IPost } from "@/types";

type PostStatsProps = {
  post: IPost;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSaved } =
    useUnsavePost();
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useGetCurrentUser();

  // Ensure the component doesn't render anything if currentUser is still loading
  if (isCurrentUserLoading) {
    return <Loader />; // Or any placeholder UI to show while loading
  }

  if (!currentUser) {
    return <p>Error: Current user not found.</p>; // Error state when currentUser is not available
  }

  console.log("Inside PostStats");
  console.log(userId);
  console.log(currentUser);

  // Fetch likes and saves without conditional hook calls
  const { data: likedBy, isPending: isLikesLoading } = useGetPostLikedBy(
    post.id
  );
  const { data: savedBy, isPending: isSavesLoading } = useGetPostSavedBy(
    post.id
  );

  const [likes, setLikes] = useState(likedBy || []); // Safe state initialization
  const [isSaved, setIsSaved] = useState(false);

  // Update `isSaved` when `savedBy` changes or when the `currentUser` changes
  useEffect(() => {
    if (savedBy && userId) {
      setIsSaved(savedBy.includes(userId)); // Set `isSaved` to true if the user is in the savedBy list
    }
  }, [savedBy, userId]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation(); // so it just works for the like button and no underlying post (if the whole post is clickable)

    let newLikedBy = [...likes];
    const hasLiked = newLikedBy.includes(userId);

    if (hasLiked) {
      newLikedBy = newLikedBy.filter((id) => id !== userId); // remove like if it is already liked
      unlikePost({ userId: currentUser.id, postId: post.id });
    } else {
      newLikedBy.push(userId);
    }

    setLikes(newLikedBy);
    likePost({ userId: currentUser.id, postId: post.id });
  };

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation(); // so it just works for the like button and no underlying post (if the whole post is clickable)

    if (savedBy) {
      setIsSaved(false);
      deleteSavedPost({ userId: currentUser.id, postId: post.id });
    } else {
      setIsSaved(true);
      savePost({ userId: currentUser.id, postId: post.id });
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-5">
        <img
          src={
            checkIsLiked(likes, currentUser!.id)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        {isSavingPost || isDeletingSaved ? (
          <Loader />
        ) : (
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="like"
            width={20}
            height={20}
            onClick={handleSavePost}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
