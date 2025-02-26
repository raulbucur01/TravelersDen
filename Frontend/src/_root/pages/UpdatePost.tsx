import ItineraryPostForm from "@/components/post/ItineraryPostForm";
import NormalPostForm from "@/components/post/NormalPostForm";
import Loader from "@/components/shared/Loader";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";

const UpdatePost = () => {
  const { id } = useParams();
  const { data: post, isPending: isGettingPost } = useGetPostById(id || "");

  if (isGettingPost || !post) return <Loader />;

  return (
    <div className="flex flex-1 justify-center bg-dm-dark min-h-screen">
      <div className="common-container bg-dm-dark-2 shadow-lg rounded-lg p-6">
        {/* Header */}
        <div className="max-w-5xl flex items-center justify-center gap-3">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="add"
          />
          <h2 className="h3-bold md:h2-bold w-full text-dm-light">
            Update Post
          </h2>
        </div>
        {post.isItinerary ? (
          <ItineraryPostForm post={post} action="Update" />
        ) : (
          <NormalPostForm post={post} action="Update" />
        )}
      </div>
    </div>
  );
};

export default UpdatePost;
