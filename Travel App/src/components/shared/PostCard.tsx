import { Link } from "react-router-dom";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import { IPost } from "@/types";
import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
import { useState } from "react";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

type PostCardProps = {
  post: IPost;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user: currentUser } = useUserContext();
  const { data: postCreator, isPending: isPostCreatorLoading } = useGetUserById(
    post.userId
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!post.userId) {
    return;
  }

  // Show a loader or placeholder while fetching the user
  if (isPostCreatorLoading) {
    return <Loader />;
  }
  // Convert tags into an array
  const separatedPostTags = post.tags?.replace(/ /g, "").split(",") || [];

  const navigateFiles = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentIndex(
        (prev) => (prev - 1 + post.mediaUrls.length) % post.mediaUrls.length
      );
    } else {
      setCurrentIndex((prev) => (prev + 1) % post.mediaUrls.length);
    }
  };

  const renderMedia = () => {
    const currentMedia = post.mediaUrls[currentIndex];
    if (currentMedia) {
      if (currentMedia.type === "Photo") {
        return (
          <img
            src={currentMedia.url}
            alt="post image"
            className="post-card_img"
          />
        );
      } else if (currentMedia.type === "Video") {
        return (
          <video
            controls
            className="post-card_img"
            src={currentMedia.url}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }} // Prevent the default behavior (following the link)
          />
        );
      }
    }
    return null;
  };

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
          {/* View Details Button
          <Link to={`/posts/${post.postId}`} className="">
            <img
              src="/assets/icons/more.png"
              width={25}
              height={25}
              alt="more"
            />
          </Link> */}

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

        {post.mediaUrls.length > 0 && (
          <div className="relative">
            {renderMedia()}

            {/* Show navigation arrows if there are multiple media files */}
            {post.mediaUrls.length > 1 && (
              <>
                {currentIndex !== 0 && (
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 flex items-center opacity-30 hover:opacity-70">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault(); // Prevent the default behavior (following the link)
                        navigateFiles("prev");
                      }}
                      className="bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full pointer-events-auto"
                    >
                      <img
                        src="/assets/icons/left-arrow.png"
                        alt="left-arrow"
                        className="w-5 h-auto"
                      />
                    </button>
                  </div>
                )}

                {currentIndex !== post.mediaUrls.length - 1 && (
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center opacity-30 hover:opacity-70">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault(); // Prevent the default behavior (following the link)
                        navigateFiles("next");
                      }}
                      className="bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full pointer-events-auto"
                    >
                      <img
                        src="/assets/icons/right-arrow.png"
                        alt="right-arrow"
                        className="w-5 h-auto"
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Link>

      <PostStats post={post} userId={currentUser.userId} />
    </div>
  );
};

export default PostCard;
