import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";
import CommentSection from "@/components/comment/CommentSection";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { formatToRelativeDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import MediaCarousel from "@/components/shared/MediaCarousel";
import ItineraryDetails from "@/components/post/ItineraryDetails";
import ExpandableText from "@/components/shared/ExpandableText";

const PostDetails = () => {
  const { id } = useParams();
  const { user: currentUser } = useUserContext();
  const { data: post, isPending: isGettingPost } = useGetPostById(id || "");
  const { data: postCreator, isPending: isPostCreatorLoading } = useGetUserById(
    post?.userId
  );

  if (isPostCreatorLoading || isGettingPost) {
    return <Loader />;
  }

  // Convert tags into an array
  const separatedPostTags = post?.tags?.replace(/ /g, "").split(",") || [];

  const handleDeletePost = () => {};
  return (
    <>
      {isGettingPost ? (
        <Loader />
      ) : (
        <div className="flex w-full px-5 md:px-14 gap-5">
          {/* Post Details Section */}
          <div className="flex-1 overflow-scroll custom-scrollbar">
            <div className="post_details-container">
              <div className="post_details-card">
                {/* Media Carousel */}
                <div className="post_details-media-carousel">
                  <MediaCarousel mediaUrls={post!.mediaUrls} />
                </div>

                {/* Post Details Top Info */}
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
                        <div className="flex-center gap-2 text-dm-dark-4">
                          <p className="subtle-semibold lg:small-regular ">
                            {formatToRelativeDate(post!.createdAt)}
                          </p>
                          •
                          <p className="subtle-semibold lg:small-regular">
                            {post!.location}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="flex-center">
                      <Link
                        to={`/update-post/${post?.postId}`}
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

                  {/* Post Caption and Body + Tags */}
                  <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                    <h1 className="base-medium lg:body-bold text-dm-light mb-4">
                      {post!.caption}
                    </h1>
                    <ExpandableText
                      text={post!.body}
                      maxLength={250}
                      className="whitespace-pre-line overflow-hidden"
                    />
                    <ul className="flex gap-1 mt-2 self-center">
                      {separatedPostTags.map((tag: string) => (
                        <li key={tag} className="text-dm-dark-4">
                          #{tag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Post Stats */}
                  <div className="w-full">
                    <PostStats post={post!} userId={currentUser.userId} />
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary data if it is an itinerary post */}
            {post!.isItinerary && <ItineraryDetails id={post!.postId} />}

            <CommentSection postId={post!.postId} />
          </div>

          {/* Similar Posts Section */}
          <div className="hidden xl:block w-1/3 max-w-sm">
            <h2 className="text-lg font-semibold text-dm-light">
              Similar Posts
            </h2>
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetails;
