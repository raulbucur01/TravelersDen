import { BasePost } from "@/types";
import MediaSlideshow from "../reusable/MediaSlideshow";
import { Link } from "react-router-dom";
import { useGetUserById } from "@/api/tanstack-query/queriesAndMutations";
import { formatToRelativeDate } from "@/lib/utils";

type SimilarPostCardProps = {
  post: BasePost;
};

const SimilarPostCard = ({ post }: SimilarPostCardProps) => {
  const { data: postCreator, isPending: isPostCreatorLoading } = useGetUserById(
    post.userId
  );

  // Convert tags into an array
  const separatedPostTags = post?.tags?.replace(/ /g, "").split(",") || [];

  return (
    <div className="relative w-full h-96 overflow-hidden border-t-4 border-l-4 border-dm-dark">
      {/* Top 1/4 Section (Profile with Black Background) */}
      <div className="relative z-20 h-1/4 bg-dm-dark-2 text-white flex ">
        {postCreator && (
          <Link
            to={`/profile/${postCreator.userId}`}
            className="flex gap-3 items-center p-2"
          >
            <img
              src={
                postCreator.imageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="lg:h-12 lg:w-12 w-8 h-8 rounded-full"
            />
            <div className="flex flex-col">
              <p className="base-medium lg:body-bold">{postCreator.name}</p>
              <div className="flex items-center gap-2 text-dm-dark-4 text-sm">
                <p>{formatToRelativeDate(post.createdAt)}</p>•
                <p>{post.location}</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Bottom 3/4 Section (Slideshow Background & Caption + Tags) */}
      <Link
        to={`/posts/${post.postId}`}
        className="absolute left-0 w-full h-3/4 overflow-hidden"
      >
        {/* Background Media Slideshow */}
        <MediaSlideshow
          mediaUrls={post.mediaUrls}
          customStyles={{
            container: "w-full h-full",
            image: "w-full h-full object-cover",
          }}
        />
        {/* Gradient Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/60 to-transparent"></div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="absolute bottom-12 left-4 flex gap-2 max-w-full">
            <ul className="flex gap-1 mt-2 self-center">
              {separatedPostTags.map((tag: string) => (
                <li key={tag} className="text-dm-light-3">
                  #{tag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Caption */}
        <div className="absolute bottom-2 left-4 right-4 p-2 text-white rounded-md truncate">
          {post.caption}
        </div>
      </Link>
    </div>
  );
};

export default SimilarPostCard;
