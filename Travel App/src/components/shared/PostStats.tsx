import {
  useUnsavePost,
  useGetPostLikedBy,
  useGetPostSavedBy,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useGetPostLikeCount,
} from "@/lib/react-query/queriesAndMutations";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import { IPost } from "@/types";
import { useNavigate } from "react-router-dom";
import { formatCommentCount, formatLikeCount } from "@/lib/utils";

type PostStatsProps = {
  post: IPost;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const { mutateAsync: likePost, isPending: isLikingPost } = useLikePost();
  const { mutateAsync: unlikePost, isPending: isUnlikingPost } =
    useUnlikePost();
  const { mutateAsync: savePost, isPending: isSavingPost } = useSavePost();
  const { mutateAsync: unsavePost, isPending: isUnsavingPost } =
    useUnsavePost();
  const { data: likedBy, isPending: isGettingLikedBy } = useGetPostLikedBy(
    post.postId
  );
  const { data: savedBy, isPending: isGettingSavedBy } = useGetPostSavedBy(
    post.postId
  );
  const { data: likeCountData, refetch: refetchLikeCount } =
    useGetPostLikeCount(post.postId);

  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount);

  useEffect(() => {
    if (likeCountData) {
      setLikeCount(likeCountData);
    }
    if (likedBy) {
      setIsLiked(likedBy.includes(userId));
    }
  }, [likeCountData, likedBy, userId]);

  useEffect(() => {
    if (savedBy) {
      setIsSaved(savedBy.includes(userId));
    }
  }, [savedBy, userId]);

  if (isGettingLikedBy || isGettingSavedBy) return <Loader />;

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      unlikePost({ userId: userId, postId: post.postId });
    } else {
      setLikeCount((prev) => prev + 1);
      likePost({ userId: userId, postId: post.postId });
    }
    setIsLiked((prev) => !prev);
    refetchLikeCount();
  };

  const handleSave = () => {
    if (isSaved) {
      unsavePost({ userId: userId, postId: post.postId });
    } else {
      savePost({ userId: userId, postId: post.postId });
    }
    setIsSaved((prev) => !prev);
  };

  return (
    <div
      className="relative flex justify-between items-center z-20 cursor-pointer px-4 py-2"
      onClick={() => navigate(`/posts/${post.postId}`)}
    >
      {/* Like Section - Left-aligned */}
      <div className="flex items-center gap-1">
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
        <p className="text-xs sm:text-sm lg:base-medium">
          {formatLikeCount(likeCount)}
        </p>
      </div>

      {/* Comment Section - Centered */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
        <img
          src="/assets/icons/chat.svg"
          alt="comments"
          width={25}
          height={25}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/posts/${post.postId}`);
          }}
          className="cursor-pointer"
        />
        <p className="text-xs sm:text-sm lg:base-medium">
          {formatCommentCount(likeCount)}
        </p>
      </div>

      {/* Save Section - Right-aligned */}
      <div className="flex items-center gap-1">
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
