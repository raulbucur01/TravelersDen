import {
  useFollow,
  useIsFollowing,
  useUnfollow,
} from "@/api/tanstack-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { SimilarUser } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SuggestedUserCard = ({ user }: { user: SimilarUser }) => {
  const { user: currentUser } = useUserContext();

  const { data: followStatus } = useIsFollowing(
    currentUser.userId,
    user.userId
  );

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (followStatus?.isFollowing) {
      setIsFollowing(followStatus.isFollowing);
    }
  }, [followStatus]);

  const { mutate: follow, isPending: isFollowPending } = useFollow();
  const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollow();

  const handleFollowClick = () => {
    if (isFollowing) {
      setIsFollowing(false);
      unfollow({
        userIdUnfollowing: currentUser.userId,
        userIdFollowed: user.userId,
      });
    } else {
      setIsFollowing(true);
      follow({
        userIdFollowing: currentUser.userId,
        userIdFollowed: user.userId,
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-5 transition-all">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user.userId}`}>
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        </Link>

        <div>
          <Link to={`/profile/${user.userId}`}>
            <div className="font-medium text-md text-gray-800 dark:text-dm-light">
              {user.name}
            </div>
          </Link>
          <Link to={`/profile/${user.userId}`}>
            <div className="text-sm text-dm-light-3">@{user.username}</div>
          </Link>

          <div className="text-xs text-dm-light-2 mt-1">
            {user.followedBy ? (
              <>
                Followed by{" "}
                <span className="font-medium">{user.followedBy}</span>
                {user.mutualCount > 1 && ` and ${user.mutualCount - 1} others`}
              </>
            ) : (
              <>Suggested for you</>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleFollowClick}
        disabled={isFollowPending || isUnfollowPending}
        className={`text-sm py-1 w-[21%] rounded-lg transition ${
          isFollowing
            ? "bg-dm-dark-3 hover:bg-dm-secondary text-dm-light"
            : "bg-dm-dark-4 hover:bg-dm-secondary text-dm-light"
        } ${
          isFollowPending || isUnfollowPending
            ? "cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default SuggestedUserCard;
