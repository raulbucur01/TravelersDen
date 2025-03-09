import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import { IBasePost } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

const Home = () => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  const { ref, inView } = useInView(); // Detect when user scrolls to bottom

  // Trigger fetchNextPage when inView
  // In React Query, functions can get updated internally when new data arrives.
  // Including fetchNextPage ensures that the latest version of the function is always used.
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  //  Reset cache when leaving the Home page
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
    };
  }, [queryClient]);

  if (isPostLoading || !data) {
    return <Loader />;
  }

  // Flatten posts from multiple pages
  const posts = data.pages.flatMap((page) => page.posts);

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isErrorPosts && (
            <p className="text-red-500">Failed to load posts.</p>
          )}

          <ul className="flex flex-col flex-1 gap-5 w-full">
            {posts.map((post: IBasePost) => (
              <PostCard post={post} key={post.postId} />
            ))}
          </ul>

          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="text-center p-4">
            {isFetchingNextPage && <Loader />}
          </div>
        </div>
      </div>

      <div className="home-creators">Suggested Users</div>
    </div>
  );
};

export default Home;
