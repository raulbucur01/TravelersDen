import ItineraryPostDetails from "@/components/post/ItineraryPostDetails";
import Loader from "@/components/shared/Loader";
import NormalPostDetails from "@/components/post/NormalPostDetails";
import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";

const PostDetails = () => {
  const { id } = useParams();
  const { user: currentUser } = useUserContext();
  const { data: post, isPending: isGettingPost } = useGetPostById(id || "");

  return (
    <>
      {isGettingPost ? (
        <Loader />
      ) : !post.isItinerary ? (
        <NormalPostDetails id={id} currentUser={currentUser} post={post} />
      ) : (
        <ItineraryPostDetails
          id={id}
          currentUser={currentUser}
          basePostInfo={post}
        />
      )}
    </>
  );
};

export default PostDetails;
