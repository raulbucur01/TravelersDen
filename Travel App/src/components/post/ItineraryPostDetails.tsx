import CommentSection from "@/components/comment/CommentSection";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { IPost, IUser } from "@/types";
import { useState } from "react";
import { Link } from "react-router-dom";
import MediaCarousel from "../shared/MediaCarousel";

type ItineraryPostProps = {
  id: string | undefined;
  currentUser: IUser;
  basePostInfo: IPost;
};

const ItineraryPostDetails = ({
  id,
  currentUser,
  basePostInfo,
}: ItineraryPostProps) => {
  const { data: postCreator, isPending: isPostCreatorLoading } = useGetUserById(
    basePostInfo?.userId
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (isPostCreatorLoading) {
    return <Loader />;
  }

  // Convert tags into an array
  const separatedPostTags =
    basePostInfo.tags?.replace(/ /g, "").split(",") || [];

  const navigateFiles = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentIndex(
        (prev) =>
          (prev - 1 + basePostInfo.mediaUrls.length) %
          basePostInfo.mediaUrls.length
      );
    } else {
      setCurrentIndex((prev) => (prev + 1) % basePostInfo.mediaUrls.length);
    }
  };

  const renderMedia = () => {
    const currentMedia = basePostInfo.mediaUrls[currentIndex];
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

  const handleDeletePost = () => {};

  return (
    <div className="overflow-scroll custom-scrollbar">
      <div className="post_details-container">
        <div className="post_details-card">
          <MediaCarousel mediaUrls={basePostInfo.mediaUrls} />
          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${postCreator.userId}`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    postCreator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="lg:h-12 lg:w-12 w-8 h-8 rounded-full"
                />

                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-dm-light">
                    {postCreator.name}
                  </p>
                  <div className="flex-center gap-2 text-dm-secondary">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(basePostInfo.createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {basePostInfo.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center">
                <Link
                  to={`/update-post/${basePostInfo?.postId}`}
                  className={`${
                    currentUser.userId !== postCreator.userId && "hidden"
                  }`}
                >
                  <img
                    src="/assets/icons/edit.svg"
                    width={24}
                    height={24}
                    alt="edit"
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ghost_details-delete_btn ${
                    currentUser.userId !== postCreator.userId && "hidden"
                  }`}
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dm-accent" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{basePostInfo.caption}</p>
              <ul className="flex gap-1 mt-2">
                {separatedPostTags.map((tag: string) => (
                  <li key={tag} className="text-dm-secondary">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={basePostInfo} userId={currentUser.userId} />
            </div>
          </div>
        </div>
      </div>
      <CommentSection postId={basePostInfo.postId} />
    </div>
  );
};

export default ItineraryPostDetails;
