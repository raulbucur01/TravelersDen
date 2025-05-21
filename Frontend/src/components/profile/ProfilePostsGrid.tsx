import { useGetUserPosts } from "@/api/tanstack-query/queriesAndMutations";
import { useEffect } from "react";
import Loader from "../shared/Loader";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

interface ProfilePostsGridProps {
  userId: string;
  type?: "all posts" | "itineraries";
}

const ProfilePostsGrid = ({
  userId,
  type = "all posts",
}: ProfilePostsGridProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isGettingUserPosts,
  } = useGetUserPosts(userId);

  const { ref, inView } = useInView(); // Detect when user scrolls to bottom

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isGettingUserPosts || !data) {
    return <Loader />;
  }

  const posts = data.pages.flatMap((page) => page.posts);
  const displayedPosts =
    type === "itineraries" ? posts.filter((post) => post.isItinerary) : posts;

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-3 gap-4 p-4 max-w-[75%] w-full">
        {displayedPosts.map((post, index) => (
          <Link to={`/post-details/${post.postId}`} key={index}>
            <div className="relative group">
              <img
                src={post.firstMediaUrl}
                alt={`Post ${index}`}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        ))}

        {/* Infinite Scroll Trigger */}
        <div ref={ref} className="text-center col-span-3">
          {isFetchingNextPage && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePostsGrid;
