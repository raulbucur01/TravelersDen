import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import {
  useDeletePost,
  useGetPostById,
  useGetRelatedItineraryMediaUrls,
} from "@/api/tanstack-query/queriesAndMutations";
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "@/components/comment/CommentSection";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useGetUserById } from "@/api/tanstack-query/queriesAndMutations";
import { formatToRelativeDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import MediaCarousel from "@/components/shared/MediaCarousel";
import ItineraryDetails from "@/components/post/ItineraryDetails";
import ExpandableText from "@/components/shared/ExpandableText";
import { toast } from "@/hooks/use-toast";
import CustomisableAlertDialog from "@/components/shared/CustomisableAlertDialog";
import { useEffect, useRef, useState } from "react";
import { ChevronDownCircle, ChevronUpCircle } from "lucide-react";
import SimilarPosts from "@/components/shared/SimilarPosts";

const PostDetails = () => {
  const navigate = useNavigate();
  let { id } = useParams();
  const { user: currentUser } = useUserContext();
  const { data: post, isPending: isGettingPost } = useGetPostById(id || "");
  const { data: postCreator, isPending: isPostCreatorLoading } = useGetUserById(
    post?.userId
  );
  const { refetch: refetchRelatedItineraryMediaUrls } =
    useGetRelatedItineraryMediaUrls(post?.postId || "", false);

  const { mutateAsync: deletePost, isPending: isDeletingPost } =
    useDeletePost();

  // Inside your component
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const SCROLL_TOP_THRESHOLD = 500; // Adjust this value as needed
  const SCROLL_BOTTOM_THRESHOLD = 500; // Avoid flickering at the bottom

  useEffect(() => {
    if (!post?.isItinerary) return;

    const handleScroll = () => {
      if (scrollableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollableContainerRef.current;

        setIsAtTop(scrollTop <= SCROLL_TOP_THRESHOLD);
        setIsAtBottom(
          scrollTop + clientHeight >= scrollHeight - SCROLL_BOTTOM_THRESHOLD
        );
      }
    };

    const container = scrollableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Initialize state on mount
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  if (isPostCreatorLoading || isGettingPost || isDeletingPost) {
    return <Loader />;
  }

  const handleScrollToTop = () => {
    scrollableContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollToBottom = () => {
    scrollableContainerRef.current?.scrollTo({
      top: scrollableContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Convert tags into an array
  const separatedPostTags = post?.tags?.replace(/ /g, "").split(",") || [];

  const handleDeletePost = async () => {
    navigate("/");
    let toDeleteFromAppwrite: string[] = post!.mediaUrls.map(
      (media) => media.url
    );

    if (post?.isItinerary) {
      const { data: relatedItineraryMediaUrls } =
        await refetchRelatedItineraryMediaUrls();

      toDeleteFromAppwrite = [
        ...toDeleteFromAppwrite,
        ...relatedItineraryMediaUrls,
      ];
    }

    const result = await deletePost({
      postId: post!.postId,
      toDeleteFromAppwrite,
    });

    if (!result)
      return toast({
        title: "Failed to delete post, Please try again.",
      });
  };

  return (
    <>
      {isGettingPost ? (
        <Loader />
      ) : (
        <div className="flex w-full pl-5 md:pl-10 gap-10">
          {/* Post Details Section */}
          <div
            ref={scrollableContainerRef}
            className="relative flex-1 overflow-scroll custom-scrollbar"
          >
            {/* Scroll to Top Button */}
            {post?.isItinerary && !isAtTop && (
              <button
                onClick={handleScrollToTop}
                className="sticky top-5 right-0 text-dm-dark-4 z-10"
              >
                <ChevronUpCircle />
              </button>
            )}

            {/* Post Details Container */}
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

                      {/* DELETE with CONFIRMATION */}
                      {currentUser.userId === postCreator.userId && (
                        <CustomisableAlertDialog
                          trigger={
                            <Button className="bg-transparent hover:bg-transparent">
                              <img
                                src="/assets/icons/delete.svg"
                                alt="delete"
                                width={24}
                                height={24}
                              />
                            </Button>
                          }
                          title="Delete Post"
                          description="Are you sure you want to delete this post? This action cannot be undone."
                          cancelText="Cancel"
                          actionText="Delete"
                          onConfirm={handleDeletePost}
                        />
                      )}
                    </div>
                  </div>

                  <hr className="border w-full border-dm-accent" />

                  {/* Post Caption and Body + Tags */}
                  <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                    <h1 className="base-medium lg:body-bold text-dm-light mb-4">
                      {post!.caption}
                    </h1>

                    <div className="flex flex-col flex-grow">
                      <ExpandableText
                        text={post!.body}
                        maxLength={250}
                        className="whitespace-pre-line overflow-hidden"
                      />
                    </div>

                    {separatedPostTags[0] && (
                      <ul className="flex gap-1 mt-2 self-start">
                        {separatedPostTags.map((tag: string) => (
                          <li key={tag} className="text-dm-dark-4">
                            #{tag}
                          </li>
                        ))}
                      </ul>
                    )}
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

            {/* Scroll to Bottom Button */}
            {post?.isItinerary && !isAtBottom && (
              <button
                onClick={handleScrollToBottom}
                className="sticky bottom-5 left-0 text-dm-dark-4 z-10"
              >
                <ChevronDownCircle />
              </button>
            )}

            <CommentSection postId={post!.postId} />
          </div>

          {/* Similar Posts Section */}
          <div className="hidden xl:block w-1/3 max-w-md overflow-y-auto custom-scrollbar">
            <h1 className="base-medium lg:body-bold text-dm-light ml-1 mt-2">
              Similar Posts
            </h1>
            <SimilarPosts postId={post!.postId} />
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetails;
