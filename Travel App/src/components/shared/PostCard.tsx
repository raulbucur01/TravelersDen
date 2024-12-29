import { Link } from "react-router-dom";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import { IPost } from "@/types";
import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
import { useState } from "react";
import MediaCarousel from "./MediaCarousel";

type PostCardProps = {
  post: IPost;
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
              className="lg:h-12 w-12 rounded-full"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {postCreator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.createdAt)}
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
          <h1>{post.caption}</h1>
          <ul className="flex gap-1 mt-2">
            {separatedPostTags.map((tag: string) => (
              <li key={tag} className="text-light-3">
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
