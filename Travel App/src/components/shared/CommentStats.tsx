import {
  useLikeComment,
  useUnlikeComment,
  useGetCommentLikedBy,
  useGetCommentLikeCount,
} from "@/lib/react-query/queriesAndMutations";
import { IComment, ICommentReply } from "@/types";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { formatLikeCount } from "@/lib/utils";

type CommentStatsProps = {
  comment: IComment | ICommentReply;
  userId: string;
};

const CommentStats = ({ comment, userId }: CommentStatsProps) => {
  const { mutateAsync: likeComment, isPending: isLiking } = useLikeComment();
  const { mutateAsync: unlikeComment, isPending: isUnliking } =
    useUnlikeComment();
  const { data: likedBy, isPending: isGettingLikedBy } = useGetCommentLikedBy(
    comment.commentId
  );
  const { data: likeCountData } = useGetCommentLikeCount(comment.commentId);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likesCount);

  // Update state when data is fetched
  useEffect(() => {
    if (likeCountData) setLikeCount(likeCountData);
    if (likedBy) setIsLiked(likedBy.includes(userId));
  }, [likeCountData, likedBy, userId]);

  if (isGettingLikedBy) return <Loader />;

  const toggleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
      unlikeComment(
        { userId, commentId: comment.commentId },
        {
          onError: () => {
            setLikeCount((prev) => prev + 1); // Revert count
            setIsLiked(true); // Revert like state
          },
        }
      );
    } else {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
      likeComment(
        { userId, commentId: comment.commentId },
        {
          onError: () => {
            setLikeCount((prev) => prev - 1); // Revert count
            setIsLiked(false); // Revert like state
          },
        }
      );
    }
  };

  return (
    <button
      className="flex items-center gap-1 hover:text-dm-light disabled:opacity-50"
      onClick={toggleLike}
      disabled={isLiking || isUnliking}
    >
      <div className="w-4 h-4 flex items-center justify-center">
        {isLiking || isUnliking ? (
          <Loader />
        ) : (
          <img
            src={isLiked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            alt="like"
            className="w-4 h-4"
          />
        )}
      </div>
      <span className="text-dm-light">{formatLikeCount(likeCount)}</span>
    </button>
  );
};

export default CommentStats;
