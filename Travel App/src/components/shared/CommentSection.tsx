import { useUserContext } from "@/context/AuthContext";
import { useGetCommentsForPost } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
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
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <p className="text-light-1">Comments</p>

      <p className="text-light-1">Join the discussion!</p>

      <CommentForm
        currentUserId={currentUser.userId}
        postId={postId}
        onCancel={() => {}}
      />

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
        <p className="text-center text-dm-dark-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};

export default CommentSection;
