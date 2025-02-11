import { IBasePost, MediaUrl } from "@/types";
import MediaSlideshow from "./MediaSlideshow";
import { useUserContext } from "@/context/AuthContext";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
import SimilarPostCard from "./SimilarPostCard";

type SimilarPostsProps = {
  postId: string;
};

const SimilarPosts = ({ postId }: SimilarPostsProps) => {
  const { user: currentUser } = useUserContext();
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  if (isPostLoading || !posts) return <Loader />;

  console.log(posts.slice(0, 5));

  const similarPosts = posts.slice(0, 5);

  console.log(similarPosts);

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center gap-7 pr-10">
      {similarPosts.map((post: IBasePost, index: number) => (
        <SimilarPostCard post={post} key={index} />
      ))}
    </div>
  );
};

export default SimilarPosts;
