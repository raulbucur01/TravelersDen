import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePostsGrid from "@/components/profile/ProfilePostsGrid";
import { useParams } from "react-router-dom";

const Profile = () => {
  let { id } = useParams();

  return (
    <div className="flex flex-1 justify-center min-h-screen">
      <div className="profile-container ">
        <div className="profile-inner_container h-1/3">
          <ProfileHeader userId={id!} />
        </div>

        <hr className="border-t border-dm-dark-4 w-[70%]" />

        <div className="h-2/3 w-full ">
          <ProfilePostsGrid userId={id!} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
