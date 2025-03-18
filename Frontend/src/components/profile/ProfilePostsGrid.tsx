import { useGetUserPosts } from "@/api/tanstack-query/queriesAndMutations";
import { useEffect } from "react";
import Loader from "../shared/Loader";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

const ProfilePostsGrid = ({ userId }: { userId: string }) => {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 mx-10">
      {posts.map((post, index) => (
        <Link to={`/posts/${post.postId}`} key={index}>
          <div key={index} className="relative group">
            <img
              src={post.firstMediaUrl}
              alt={`Post ${index}`}
              className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      ))}

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="text-center">
        {isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
};

export default ProfilePostsGrid;
