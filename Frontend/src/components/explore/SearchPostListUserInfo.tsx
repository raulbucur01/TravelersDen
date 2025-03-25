import { useGetUserById } from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";

const SearchPostListUserInfo = ({ userId }: { userId: string }) => {
  const { data: user, isPending: isGettingUser } = useGetUserById(userId);

  if (isGettingUser) return <Loader />;

  return (
    <div className="flex items-center justify-start gap-2 flex-1">
      {" "}
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="w-8 h-8 rounded-full"
      />
      <p className="line-clamp-1">{user.name}</p>
    </div>
  );
};

export default SearchPostListUserInfo;
