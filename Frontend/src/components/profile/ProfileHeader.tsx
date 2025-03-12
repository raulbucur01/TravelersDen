import { formatCount } from "@/lib/utils";
import ExpandableText from "../shared/ExpandableText";
import { useUserContext } from "@/context/AuthContext";
import {
  useFollow,
  useGetUserById,
  useIsFollowing,
  useUnfollow,
} from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

const ProfileHeader = ({ userId }: { userId: string }) => {
  const { user: currentUser } = useUserContext();
  const { data: user, isPending: isGettingUser } = useGetUserById(userId);
  const { data: followStatus } = useIsFollowing(currentUser.userId, userId);
  const { mutateAsync: follow } = useFollow();
  const { mutateAsync: unfollow } = useUnfollow();

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (followStatus !== undefined) {
      setIsFollowing(followStatus.isFollowing);
    }
  }, [followStatus]);

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFollowing) {
        await unfollow({
          userIdUnfollowing: currentUser.userId,
          userIdFollowed: userId,
        });
        setIsFollowing(false);
      } else {
        await follow({
          userIdFollowing: currentUser.userId,
          userIdFollowed: userId,
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFollowersDialog = () => {
    console.log("Open Followers Dialog");
    // TODO: Implement dialog logic
  };

  const handleOpenFollowingDialog = () => {
    console.log("Open Following Dialog");
    // TODO: Implement dialog logic
  };

  if (isGettingUser) return <Loader />;

  console.log(user);

  return (
    <div className="flex w-full max-w-2xl mx-auto h-full items-center gap-x-8 p-8">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt={user.username}
        className="xl:h-40 xl:w-40 h-32 w-32 object-cover rounded-full self-start"
      />

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-nowrap w-full">
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-3xl font-bold text-white truncate">
              {user.name}
            </h2>
            <p className="text-dm-light-3 text-lg">@{user.username}</p>
          </div>

          {currentUser.userId === userId ? (
            <Button
              className={
                "px-6 py-2 text-lg rounded-lg font-medium transition bg-dm-dark-3 hover:bg-dm-secondary text-dm-light"
              }
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`px-6 w-28 py-2 text-lg rounded-lg font-medium ${
                isFollowing
                  ? "bg-dm-dark-3 hover:bg-dm-secondary"
                  : "bg-dm-dark-4 hover:bg-dm-secondary"
              } text-dm-light`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <div className="flex gap-6 text-dm-light text-lg">
          <p>
            <span className="font-semibold text-dm-light-3">
              {formatCount(user.postCount || 0)}
            </span>{" "}
            Posts
          </p>
          <p className="cursor-pointer" onClick={handleOpenFollowersDialog}>
            <span className="font-semibold text-dm-light-3">
              {formatCount(user.followerCount || 0)}
            </span>{" "}
            Followers
          </p>
          <p className="cursor-pointer" onClick={handleOpenFollowingDialog}>
            <span className="font-semibold text-dm-light-3">
              {formatCount(user.followingCount || 0)}
            </span>{" "}
            Following
          </p>
        </div>
        {user.bio ? (
          <ExpandableText text={user.bio} maxLength={200} className="text-lg" />
        ) : (
          <p className="text-lg">No bio yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
