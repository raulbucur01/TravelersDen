import { formatCount } from "@/utilities/utils";
import ExpandableText from "../reusable/ExpandableText";
import { useUserContext } from "@/context/AuthContext";
import {
  useFollow,
  useGetUserById,
  useIsFollowing,
  useUnfollow,
  useUpdateUser,
} from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import CustomizableDialog from "../reusable/CustomizableDialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { UpdateUserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import ProfilePictureChanger from "./ProfilePictureChanger";
import UserListDialog from "./UserListDialog";

const ProfileHeader = ({ userId }: { userId: string }) => {
  const { user: currentUser, setUser } = useUserContext();
  const { toast } = useToast();

  const { data: user, isPending: isGettingUser } = useGetUserById(userId);
  const { data: followStatus, refetch: refetchFollowStatus } = useIsFollowing(
    currentUser.userId,
    userId
  );
  const { mutateAsync: follow } = useFollow();
  const { mutateAsync: unfollow } = useUnfollow();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();

  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState<UpdateUserProfile>(() => ({
    userId: userId,
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    updatedImageFile: null,
    previousImageUrl: user?.imageUrl,
  }));
  const [followerListDialogOpen, setFollowerListDialogOpen] = useState(false);
  const [followingListDialogOpen, setFollowingListDialogOpen] = useState(false);

  const isFollowing = followStatus?.isFollowing || false;
  const isLoading = isGettingUser || isUpdatingUser;

  // Check if profile info has changed
  const isProfileChanged = useMemo(() => {
    return (
      profileInfo.name !== user?.name ||
      profileInfo.username !== user?.username ||
      profileInfo.bio !== user?.bio ||
      profileInfo.updatedImageFile !== null
    );
  }, [profileInfo, user]);

  // Wait for user data before setting profileInfo
  useEffect(() => {
    if (user) {
      setProfileInfo({
        userId: userId,
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        updatedImageFile: null,
        previousImageUrl: user.imageUrl,
      });
    }
  }, [user]);

  const handleCancel = () => {
    // Reset to original user data when cancel is clicked
    setProfileInfo({
      userId: userId,
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      updatedImageFile: null,
      previousImageUrl: user?.imageUrl,
    });
  };

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFollowing) {
        await unfollow({
          userIdUnfollowing: currentUser.userId,
          userIdFollowed: userId,
        });
      } else {
        await follow({
          userIdFollowing: currentUser.userId,
          userIdFollowed: userId,
        });
      }

      refetchFollowStatus();
    } catch (error) {
      console.error("Error updating follow status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const userUpdated = await updateUser({
        ...profileInfo,
      });

      if (!userUpdated) {
        return toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        });
      }

      // Update the authenticated user with new details
      setUser((prevUser) => ({
        ...prevUser,
        ...profileInfo,
        imageUrl: userUpdated.imageUrl, // Merge updated fields
      }));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (file: File | null) => {
    setProfileInfo((prev) => ({ ...prev, updatedImageFile: file }));
  };

  if (isLoading) return <Loader />;

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

          {/* Edit Profile Button if current user is the profile owner or follow button otherwise */}
          {currentUser.userId === userId ? (
            <CustomizableDialog
              trigger={
                <Button
                  className={
                    "px-6 py-2 text-lg rounded-lg font-medium transition bg-dm-dark-3 hover:bg-dm-secondary text-dm-light"
                  }
                >
                  Edit Profile
                </Button>
              }
              title="Edit Profile"
              description="Make changes to your profile here."
              cancelText="Cancel"
              actionText="Update"
              onConfirm={handleUpdateProfile}
              onClose={handleCancel}
              actionDisabled={!isProfileChanged}
            >
              <div className="flex flex-col items-center justify-center w-full">
                <ProfilePictureChanger
                  currentImage={user.imageUrl}
                  onImageChange={handleImageChange}
                />
              </div>

              <div className="grid gap-5 py-4">
                <div className="grid items-center gap-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileInfo.name}
                    onChange={handleInputChange}
                    className="col-span-3 shad-input"
                  />
                </div>
                <div className="grid items-center gap-4">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={profileInfo.username}
                    onChange={handleInputChange}
                    className="col-span-3 shad-input"
                  />
                </div>
                <div className="grid items-center gap-4">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileInfo.bio}
                    onChange={handleInputChange}
                    className="col-span-3 p-2 shad-textarea custom-scrollbar"
                  />
                </div>
              </div>
            </CustomizableDialog>
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

          {/* Follower count with dialog */}
          <UserListDialog
            trigger={
              <p
                className="cursor-pointer"
                onClick={() => setFollowerListDialogOpen(true)}
              >
                <span className="font-semibold text-dm-light-3">
                  {formatCount(user.followerCount || 0)}
                </span>{" "}
                Followers
              </p>
            }
            isOpen={followerListDialogOpen}
            onClose={() => {
              setFollowerListDialogOpen(false);
            }}
            type="followers"
            userId={userId}
          />

          {/* Following count with dialog */}
          <UserListDialog
            trigger={
              <p
                className="cursor-pointer"
                onClick={() => setFollowingListDialogOpen(true)}
              >
                <span className="font-semibold text-dm-light-3">
                  {formatCount(user.followingCount || 0)}
                </span>{" "}
                Following
              </p>
            }
            isOpen={followingListDialogOpen}
            onClose={() => {
              setFollowingListDialogOpen(false);
            }}
            type="following"
            userId={userId}
          />
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
