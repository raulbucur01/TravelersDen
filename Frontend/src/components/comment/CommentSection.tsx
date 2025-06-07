import { useUserContext } from "@/context/AuthContext";
import { useGetCommentsForPost } from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

type CommentSectionProps = {
  postId: string;
};

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user: currentUser } = useUserContext();
  const { data: comments, isPending: isGettingComments } =
    useGetCommentsForPost(postId);

  if (isGettingComments) return <Loader />;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-dm-dark-1 rounded-lg shadow-md space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-dm-light">Comments</h2>
        <p className="text-md text-dm-light-3">
          Join the discussion and share your thoughts!
        </p>
      </div>

      {/* Comment Form */}
      <div className=" bg-dm-dark-2 shadow-sm">
        <CommentForm
          currentUserId={currentUser.userId}
          postId={postId}
          onCancel={() => {}}
        />
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        {comments?.length ? (
          comments.map((comment) => (
            <Comment
              key={comment.commentId}
              comment={comment}
              currentUser={currentUser}
              headCommentId={comment.commentId}
            />
          ))
        ) : (
          <p className="text-center text-dm-light-3 italic">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
