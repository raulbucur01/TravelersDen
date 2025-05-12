import {
  useGetRecentPosts,
  useSearchPosts,
} from "@/api/tanstack-query/queriesAndMutations";
import { QUERY_KEYS } from "@/api/tanstack-query/queryKeys";
import SearchPostList from "@/components/explore/SearchPostList";
import Loader from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import { BasePost } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";

const Explore = () => {
  const { ref, inView } = useInView();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchValue, 500);

  const {
    data: recentPosts,
    fetchNextPage: recentPostsFetchNextPage,
    hasNextPage: recentPostsHasNextPage,
    isFetchingNextPage: recentPostsIsFetchingNextPage,
    isPending: isRecentPostsLoading,
  } = useGetRecentPosts();

  const {
    data: searchedPosts,
    fetchNextPage: searchedPostsFetchNextPage,
    hasNextPage: searchedPostsHasNextPage,
    isFetchingNextPage: searchedPostsIsFetchingNextPage,
    isPending: isSearchedPostsLoading,
  } = useSearchPosts(debouncedSearchQuery.trim());

  const showSearchResults = debouncedSearchQuery.length > 3;

  // Flatten the paginated data
  const posts = showSearchResults
    ? searchedPosts?.pages?.flatMap((page) => page.posts) || []
    : recentPosts?.pages?.flatMap((page) => page.posts) || [];

  // Handle infinite scrolling
  useEffect(() => {
    if (!inView) return;
    if (searchedPostsIsFetchingNextPage || recentPostsIsFetchingNextPage)
      return;

    if (showSearchResults) {
      if (searchedPostsHasNextPage) {
        searchedPostsFetchNextPage();
      }
    } else {
      if (recentPostsHasNextPage) {
        recentPostsFetchNextPage();
      }
    }
  }, [
    inView,
    showSearchResults,
    searchedPostsHasNextPage,
    searchedPostsIsFetchingNextPage,
    searchedPostsFetchNextPage,
    recentPostsHasNextPage,
    recentPostsIsFetchingNextPage,
    recentPostsFetchNextPage,
  ]);

  const isLoading =
    (showSearchResults ? isSearchedPostsLoading : isRecentPostsLoading) &&
    posts.length === 0;

  console.log("posts", posts);
  console.log("searchedPosts", searchedPosts);
  console.log("recentPosts", recentPosts);

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full text-center">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dm-dark">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">
          {showSearchResults ? "Search Results" : "Popular Today"}
        </h3>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {isLoading ? (
          <Loader />
        ) : posts.length === 0 ? (
          <p className="text-center text-dm-light-3">No results found.</p>
        ) : (
          <SearchPostList posts={posts} />
        )}
      </div>

      <div ref={ref} className="mt-10">
        {posts.length > 0 &&
          (recentPostsIsFetchingNextPage || searchedPostsIsFetchingNextPage ? (
            <Loader />
          ) : (
            <p className="text-center text-dm-light-3 w-full mt-10">
              You've reached the end!
            </p>
          ))}
      </div>
    </div>
  );
};

export default Explore;
