import { BasePost, MediaUrl } from "@/types";
import MediaSlideshow from "./MediaSlideshow";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetRecentPosts,
  useGetSimilarPosts,
} from "@/api/tanstack-query/queriesAndMutations";
import Loader from "./Loader";
import SimilarPostCard from "./SimilarPostCard";

type SimilarPostsProps = {
  postId: string;
};

const SimilarPosts = ({ postId }: SimilarPostsProps) => {
  const { data: similarPosts, isPending: similarPostsLoading } =
    useGetSimilarPosts(postId);

  if (similarPostsLoading || !similarPosts) return <Loader />;

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center gap-7 pr-10">
      {similarPosts.map((post: BasePost, index: number) => (
        <SimilarPostCard post={post} key={index} />
      ))}
    </div>
  );
};

export default SimilarPosts;
