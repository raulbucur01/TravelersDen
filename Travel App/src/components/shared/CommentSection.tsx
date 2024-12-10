import { useUserContext } from "@/context/AuthContext";
import { useGetCommentsForPost } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
import Comment from "./Comment";

type CommentSectionProps = {
  postId: string;
};

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user: currentUser } = useUserContext();
  const { data: comments, isPending: isGettingComments } =
    useGetCommentsForPost(postId);

  if (isGettingComments) return <Loader />;

  return (
    <div className="comment-section space-y-4 p-4">
      <p className="text-light-1">Comments</p>

      {comments?.length ? (
        comments.map((comment) => (
          <Comment
            key={comment.commentId}
            comment={comment}
            currentUser={currentUser}
          />
        ))
      ) : (
        <p className="text-center text-light-3">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};

export default CommentSection;
