import { IComment, ICommentReply, IUser } from "@/types";
import { useState } from "react";
import { Link } from "react-router-dom";
import CommentForm from "./CommentForm";
import { multiFormatDateString } from "@/lib/utils";
import { useDeleteComment } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";

type CommentProps = {
  comment?: IComment;
  reply?: ICommentReply;
  currentUser: IUser;
  headCommentId: string;
};

const Comment = ({
  comment,
  reply,
  currentUser,
  headCommentId,
}: CommentProps) => {
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteComment();

  const data = comment || reply;

  if (!data) {
    return null;
  }

  const isOwner = currentUser.userId === data.user.userId;

  const [isBeingRepliedTo, setIsBeingRepliedTo] = useState(false);

  const handleLike = () => {
    // Add your like functionality here
  };

  const handleReply = () => {
    setIsBeingRepliedTo((prevState) => !prevState);
  };

  const handleDelete = () => {
    deleteComment(data.commentId);
  };

  const handleEdit = () => {
    // Add your edit functionality here
  };

  const handleCancelReply = () => {
    setIsBeingRepliedTo(false); // Hide the reply form when cancel is clicked
  };
  return (
    <div
      className={`comment-container rounded-md flex flex-col ${
        reply
          ? "pl-6 border-l-2 border-t-2 border-dm-secondary bg-dm-dark"
          : "bg-dm-dark-2 pl-6 border-l-2 border-t-2 border-dm-secondary"
      } space-y-3 py-4`}
    >
      {/* Top Section: User Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${data.user.userId}`}>
            <img
              src={
                data.user.imageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt={`${data.user.username}'s profile`}
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
            />
          </Link>
          <div>
            <Link to={`/profile/${data.user.userId}`}>
              <span className="text-dm-light font-bold cursor-pointer">
                {data.user.name}
              </span>
              <span className="text-dm-dark-4 text-sm">
                &nbsp; &nbsp; @{data.user.username}
              </span>
            </Link>

            <p className="text-dm-light text-sm mt-1">
              {reply?.mention && (
                <Link to={`/profile/${reply.mentionedUserId}`}>
                  <span className="text-dm-dark-4">{reply.mention} </span>
                </Link>
              )}
              {data.body}
            </p>
          </div>
        </div>
        {/* Date Section */}
        <span className="text-dm-dark-4 text-sm mr-10">
          {multiFormatDateString(data.createdAt)}
        </span>
      </div>

      {/* Bottom Section: Actions */}
      <div className="flex items-center justify-start text-dm-secondary gap-6 text-sm mt-2">
        {/* Like Button */}
        <button
          className="flex items-center gap-1 hover:text-dm-light"
          onClick={handleLike}
        >
          <img src="/assets/icons/like.svg" alt="like" className="w-4 h-4" />
          <span className="text-dm-light">{data.likesCount}</span>
        </button>

        {/* Reply Button */}
        <button
          className="hover:text-dm-light text-dm-dark-4"
          onClick={handleReply}
        >
          Reply
        </button>

        {/* Delete Button (if owner) */}
        {isOwner && (
          <button className="hover:text-dm-light" onClick={handleDelete}>
            {isDeletingComment ? (
              <Loader />
            ) : (
              <img
                src="/assets/icons/delete.svg"
                alt="delete"
                className="w-4 h-4"
              />
            )}
          </button>
        )}
      </div>

      {/* Show Reply Form if `isBeingRepliedTo` is true */}
      {isBeingRepliedTo && (
        <div className="mt-4">
          {/* Extracted common properties */}
          <CommentForm
            currentUserId={currentUser.userId}
            postId={data.postId}
            parentCommentId={headCommentId}
            mention={
              data?.user.userId !== currentUser.userId
                ? data?.user.username
                : "" // Mention only if it's not the current user's own comment/reply
            }
            mentionedUserId={
              data?.user.userId !== currentUser.userId ? data?.user.userId : "" // Mentioned userId only if it's not the current user's own comment/reply
            }
            onCancel={handleCancelReply}
          />
        </div>
      )}

      {/* Replies */}
      {comment?.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.commentId}
              reply={reply}
              currentUser={currentUser}
              headCommentId={headCommentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
