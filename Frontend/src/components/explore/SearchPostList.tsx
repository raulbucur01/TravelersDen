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
        <li key={post.postId} className="relative min-w-80 h-80">
          <Link to={`/posts/${post.postId}`} className="grid-post_link">
            <MediaSlideshow mediaUrls={post.mediaUrls} />
          </Link>

          <div className="grid-post_user">
            {showUser && <SearchPostListUserInfo userId={post.userId} />}
            {showStats && <PostStats post={post} userId={user.userId} />}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SearchPostList;
