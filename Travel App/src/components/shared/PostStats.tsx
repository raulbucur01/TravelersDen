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
import { useNavigate } from "react-router-dom";

type PostStatsProps = {
  post: IPost;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const { mutate: likePost, isPending: isLikingPost } = useLikePost();
  const { mutate: unlikePost, isPending: isUnlikingPost } = useUnlikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: unsavePost, isPending: isUnsavingPost } = useUnsavePost();
  const { data: likedBy, isPending: isGettingLikedBy } = useGetPostLikedBy(
    post.postId
  );
  const { data: savedBy, isPending: isGettingSavedBy } = useGetPostSavedBy(
    post.postId
  );

  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount);

  useEffect(() => {
    if (likedBy) {
      setIsLiked(likedBy.includes(userId));
    }
  }, [likedBy, userId]);

  useEffect(() => {
    if (savedBy) {
      setIsSaved(savedBy.includes(userId));
    }
  }, [savedBy, userId]);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      unlikePost({ userId: userId, postId: post.postId });
    } else {
      setLikeCount((prev) => prev + 1);
      likePost({ userId: userId, postId: post.postId });
    }
    setIsLiked((prev) => !prev);
  };

  const handleSave = () => {
    if (isSaved) {
      unsavePost({ userId: userId, postId: post.postId });
    } else {
      savePost({ userId: userId, postId: post.postId });
    }
    setIsSaved((prev) => !prev);
  };

  if (isGettingLikedBy || isGettingSavedBy) return <Loader />;

  // console.log("Entered post with:", post.caption);
  // console.log("likedBy", likedBy);
  // console.log("savedBy", savedBy);

  return (
    <div
      className="flex justify-between items-center z-20 cursor-pointer"
      onClick={() => navigate(`/post/${post.postId}`)}
    >
      <div className="flex gap-2 items-center">
        {isLikingPost || isUnlikingPost ? (
          <Loader />
        ) : (
          <img
            src={isLiked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            alt="like"
            width={25}
            height={25}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className="cursor-pointer"
          />
        )}
        <p className="small-medium lg:base-medium">{likeCount}</p>
      </div>

      <div className="flex gap-2 items-center">
        {/* to be changed to comments count */}
        <img
          src="/assets/icons/chat.svg"
          alt="comments"
          width={25}
          height={25}
          onClick={() => navigate(`/post/${post.postId}`)}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{post.likesCount}</p>
      </div>

      <div className="flex gap-2">
        {isSavingPost || isUnsavingPost ? (
          <Loader />
        ) : (
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={25}
            height={25}
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
