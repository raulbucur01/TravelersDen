import { IComment, ICommentCreator, ICommentReply, IUser } from "@/types";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import CommentForm from "./CommentForm";

type CommentProps = {
  comment?: IComment;
  reply?: ICommentReply;
  currentUser: IUser;
};

const Comment = ({ comment, reply, currentUser }: CommentProps) => {
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
    // Add your delete functionality here
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
      <div className="flex items-start gap-3">
        <Link to={`/profile/${data.user.userId}`}>
          <img
            src={data.user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={`${data.user.username}'s profile`}
            className="w-10 h-10 rounded-full object-cover cursor-pointer" // Add cursor-pointer for visual indication
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${data.user.userId}`}>
              <span className="text-dm-light font-bold cursor-pointer">
                {data.user.name}
              </span>
            </Link>
            <span className="text-dm-secondary text-sm">
              {new Date(data.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-dm-light text-sm mt-1">{data.body}</p>
        </div>
      </div>

      {/* Bottom Section: Actions */}
      <div className="flex items-center justify-start text-dm-secondary gap-6 text-sm mt-2">
        {/* Like Button */}
        <button
          className="flex items-center gap-1 hover:text-dm-light"
          onClick={handleLike}
        >
          <img src="/assets/icons/like.svg" alt="like" className="w-4 h-4" />
          <span>{data.likesCount}</span>
        </button>

        {/* Reply Button */}
        <button className="hover:text-dm-light" onClick={handleReply}>
          Reply
        </button>

        {/* Delete Button (if owner) */}
        {isOwner && (
          <button className="hover:text-dm-light">
            <img
              src="/assets/icons/delete.svg"
              alt="delete"
              className="w-4 h-4"
            />
          </button>
        )}
      </div>

      {/* Show Reply Form if `isBeingRepliedTo` is true */}
      {isBeingRepliedTo && (
        <div className="mt-4">
          <CommentForm
            currentUser={currentUser.userId}
            commentCreator={data.user}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
