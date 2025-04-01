import { Link } from "react-router-dom";

import { useUserContext } from "@/context/AuthContext";
import PostStats from "../shared/PostStats";
import { IBasePost } from "@/types";
import SearchPostListUserInfo from "./SearchPostListUserInfo";
import MediaSlideshow from "../shared/MediaSlideshow";

type SearchPostListProps = {
  posts: IBasePost[];
  showUser?: boolean;
  showStats?: boolean;
};

const SearchPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: SearchPostListProps) => {
  const { user } = useUserContext();

  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <li
          key={post.postId}
          className="relative min-w-80 h-80 overflow-hidden rounded-lg"
        >
          {/* Background Media */}
          <MediaSlideshow
            mediaUrls={post.mediaUrls}
            customStyles={{
              container: "w-full h-full",
              image: "w-full h-full object-cover",
              video: "w-full h-full object-cover",
            }}
          />

          {/* Full Overlay Link for Navigation */}
          <Link
            to={`/posts/${post.postId}`}
            className="absolute inset-0 z-10"
          />

          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 bg-gradient-to-b from-black/50 via-transparent to-black/50">
            {showUser && (
              <Link
                to={`/profile/${post.userId}`}
                className="absolute top-3 left-3 rounded-lg z-10"
              >
                <SearchPostListUserInfo userId={post.userId} />
              </Link>
            )}

            {/* Bottom Right: Post Stats */}
            {showStats && (
              <div className="absolute bottom-3 right-3 z-10">
                <PostStats
                  usedIn="searchcard"
                  post={post}
                  userId={user.userId}
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SearchPostList;
