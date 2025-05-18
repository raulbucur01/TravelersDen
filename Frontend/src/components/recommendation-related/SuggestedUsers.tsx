import { useGetSimilarUsers } from "@/api/tanstack-query/queriesAndMutations";
import SuggestedUserCard from "./SuggestedUserCard";
import { useUserContext } from "@/context/AuthContext";
import Loader from "../shared/Loader";

export const SuggestedUsers = () => {
  const { user: currentUser } = useUserContext();
  const {
    data: similarUsers,
    isPending: similarUsersLoading,
    isError: isSimilarUsersError,
  } = useGetSimilarUsers(currentUser.userId);

  console.log(similarUsers);

  return (
    <div className="home-creators">
      <h1 className="text-2xl font-bold text-dm-light">Suggested Users</h1>
      {similarUsersLoading ? (
        <Loader />
      ) : isSimilarUsersError || !similarUsers?.length ? (
        <p className="text-gray-500 text-sm">No suggestions available.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {similarUsers.map((user) => (
            <SuggestedUserCard key={user.userId} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};
