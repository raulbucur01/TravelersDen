import { useEffect } from "react";
import CustomizableDialog from "../shared/CustomizableDialog";
import { useInView } from "react-intersection-observer";
import { useGetUserConnections } from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";
import { Link } from "react-router-dom";

interface UserListDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  type: "followers" | "following";
  trigger: React.ReactNode;
}

const UserListDialog = ({
  userId,
  isOpen,
  onClose,
  type,
  trigger,
}: UserListDialogProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isGettingUserConnections,
    isError: isErrorPosts,
    refetch: refetchUserConnections,
  } = useGetUserConnections(userId, type, isOpen);

  const { ref, inView } = useInView(); // Detect when user scrolls to bottom

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
    console.log("inView:", inView, "hasNextPage:", hasNextPage);
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (isOpen) {
      refetchUserConnections(); // Force refetching when the dialog is opened
    }
  }, [isOpen, refetchUserConnections]);

  console.log("data:", data);
  const users = data?.pages.flatMap((page) =>
    type === "followers" ? page.followers : page.following
  );

  return (
    <CustomizableDialog
      trigger={trigger}
      onClose={onClose}
      className="w-[400px]"
      hasAction={false}
      cancelText="Close"
      title={`${type === "followers" ? "Followers" : "Following"}`}
    >
      <div className="h-[300px] overflow-y-auto p-4 custom-scrollbar">
        {/* Scrollable user list */}
        <div>
          {isGettingUserConnections ? (
            <Loader />
          ) : isErrorPosts ? (
            <p>Error loading users.</p>
          ) : (
            <ul className="space-y-4">
              {users?.map((user, index) => (
                <Link
                  to={`/profile/${user.userId}`}
                  key={index}
                  style={{ display: "block" }}
                >
                  <li
                    key={index}
                    className="flex items-center space-x-4 p-2 bg-dm-dark rounded-lg hover:bg-dm-secondary transition-all"
                  >
                    {/* User Image */}
                    <img
                      src={user.imageUrl || "/default-avatar.png"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {/* User Info */}
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg text-dm-light">
                        {user.name}
                      </span>
                      <span className="text-sm text-dm-light-3">
                        @{user.username}
                      </span>
                    </div>
                  </li>
                </Link>
              ))}
            </ul>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="text-center p-4">
            {isFetchingNextPage && <Loader />}
          </div>
        </div>
      </div>
    </CustomizableDialog>
  );
};

export default UserListDialog;
