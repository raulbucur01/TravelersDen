import { BasePost } from "@/types";
import { useGetSimilarPosts } from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";
import SimilarPostCard from "./SimilarPostCard";

type SimilarPostsProps = {
  postId: string;
};

const SimilarPosts = ({ postId }: SimilarPostsProps) => {
  const { data: similarPosts, isPending: similarPostsLoading } =
    useGetSimilarPosts(postId);

  if (similarPostsLoading || !similarPosts) return <Loader />;

  return (
    <div className="hidden xl:block w-1/3 max-w-md overflow-y-auto custom-scrollbar">
      <h1 className="base-medium lg:body-bold text-dm-light ml-1 mt-2 mb-2">
        Similar Posts
      </h1>
      <div className="w-full overflow-y-auto flex flex-col items-center gap-7 pr-10">
        {similarPosts.map((post: BasePost, index: number) => (
          <SimilarPostCard post={post} key={index} />
        ))}
      </div>
    </div>
  );
};

export default SimilarPosts;
