import { Link } from "react-router-dom";
import { formatToRelativeDate } from "@/utilities/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "../shared/PostStats";
import { BasePost } from "@/types";
import { useGetUserById } from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";
import MediaCarousel from "../reusable/MediaCarousel";
import ExpandableText from "../reusable/ExpandableText";

type PostCardProps = {
  post: BasePost;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user: currentUser } = useUserContext();
  const { data: postCreator, isPending: isPostCreatorLoading } = useGetUserById(
    post.userId
  );

  if (!post.userId) {
    return;
  }

  // Show a loader or placeholder while fetching the user
  if (isPostCreatorLoading) {
    return <Loader />;
  }
  // Convert tags into an array
  const separatedPostTags = post.tags?.replace(/ /g, "").split(",") || [];

  return (
    <div className="post-card">
      <div className="flex-between border-b pb-4 border-dm-secondary">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${postCreator.userId}`}>
            <img
              src={
                postCreator.imageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="h-12 w-12 rounded-full object-cover"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-dm-light">
              {postCreator.name}
            </p>
            <div className="flex-center gap-2 text-dm-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {formatToRelativeDate(post.createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Edit Button */}
          {currentUser.userId === postCreator.userId && (
            <Link to={`/update-post/${post.postId}`}>
              <img
                src="/assets/icons/edit.svg"
                alt="edit"
                width={25}
                height={25}
              />
            </Link>
          )}
        </div>
      </div>

      <Link to={`/posts/${post.postId}`}>
        <div className="small-medium lg:base-medium py-5">
          <ExpandableText
            text={post.caption}
            maxLength={130}
            className="whitespace-pre-line overflow-hidden"
          />
          <ul className="flex gap-1 mt-2">
            {separatedPostTags.map((tag: string) => (
              <li key={tag} className="text-dm-light-3">
                #{tag}
              </li>
            ))}
          </ul>
        </div>
      </Link>

      <MediaCarousel mediaUrls={post.mediaUrls} />

      <PostStats post={post} userId={currentUser.userId} />
    </div>
  );
};

export default PostCard;
