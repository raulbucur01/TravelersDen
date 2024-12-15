import { IComment, ICommentReply, IUser } from "@/types";
import { useState } from "react";
import { Link } from "react-router-dom";
import CommentForm from "./CommentForm";
import { multiFormatDateString } from "@/lib/utils";
import { useDeleteComment } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
import CommentStats from "./CommentStats";

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
  const { mutateAsync: deleteComment, isPending: isDeletingComment } =
    useDeleteComment();

  const data = comment || reply;

  if (!data) {
    return null;
  }

  const isOwner = currentUser.userId === data.user.userId;
  const [isBeingRepliedTo, setIsBeingRepliedTo] = useState(false);
  const [isBeingEdited, setIsBeingEdited] = useState(false);

  const handleReplyView = () => {
    setIsBeingRepliedTo((prevState) => !prevState);
    setIsBeingEdited(false);
  };

  const handleEditView = () => {
    setIsBeingEdited((prevState) => !prevState);
    setIsBeingRepliedTo(false);
  };

  const handleDelete = () => {
    deleteComment(data.commentId);
  };

  const handleCancelReply = () => {
    setIsBeingRepliedTo(false); // Hide the reply form when cancel is clicked
  };

  const handleCancelEdit = () => {
    setIsBeingEdited(false); // Hide the edit form when cancel is clicked
  };
  return (
    <div
      className={`comment-container rounded-md flex flex-col ${
        reply
          ? "pl-6 border-l-2 border-t-2 border-dm-secondary bg-dm-dark"
          : "bg-dm-dark-2 pl-6 border-l-2 border-t-2 border-dm-secondary"
      } space-y-3 py-4 mx-auto`}
    >
      {/* Top Section: User Info and Date */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* User Profile Picture */}
          <Link to={`/profile/${data.user.userId}`}>
            <img
              src={
                data.user.imageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt={`${data.user.username}'s profile`}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          </Link>

          {/* User Name and Username */}
          <div>
            <Link to={`/profile/${data.user.userId}`}>
              <span className="text-dm-light font-bold">{data.user.name}</span>
              <span className="text-dm-dark-4 text-sm ml-2">
                @{data.user.username}
              </span>
            </Link>
          </div>
        </div>

        {/* Date Section */}
        <span className="text-dm-dark-4 text-sm mr-5">
          {multiFormatDateString(data.createdAt)}
        </span>
      </div>

      {/* Comment Body */}
      <div className="mt-2 mr-5">
        <p className="text-dm-light text-sm whitespace-pre-wrap break-words leading-relaxed">
          {reply?.mention && (
            <Link to={`/profile/${reply.mentionedUserId}`}>
              <span className="text-dm-dark-4">{reply.mention} </span>
            </Link>
          )}
          {data.body}
        </p>
      </div>

      {/* Bottom Section: Actions */}
      <div className="flex items-center justify-start text-dm-secondary gap-6 text-sm mt-2">
        <CommentStats comment={data} userId={currentUser.userId} />

        {/* Reply Button */}
        <button
          className="hover:text-dm-dark-4 text-dm-light"
          onClick={handleReplyView}
        >
          Reply
        </button>

        {/* Edit Button (if owner) */}
        {isOwner && (
          <button
            className="hover:text-dm-light text-dm-dark-4"
            onClick={handleEditView}
          >
            <img src="/assets/icons/edit.svg" alt="edit" className="w-4 h-4" />
          </button>
        )}

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

      {isBeingEdited && (
        <div className="mt-4">
          <CommentForm
            currentUserId={currentUser.userId}
            postId={data.postId}
            parentCommentId={headCommentId}
            mention={reply?.mention ? reply.mention : ""}
            mentionedUserId={
              reply?.mentionedUserId ? reply.mentionedUserId : ""
            }
            editMode={true}
            previousBody={data.body}
            editedCommentId={data.commentId}
            onCancel={handleCancelEdit}
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
