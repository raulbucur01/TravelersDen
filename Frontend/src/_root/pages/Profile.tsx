import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePostsGrid from "@/components/profile/ProfilePostsGrid";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams } from "react-router-dom";

const Profile = () => {
  let { id } = useParams();

  const [activeTab, setActiveTab] = useState<"all posts" | "itineraries">(
    "all posts"
  );

  return (
    <div className="flex flex-1 justify-center min-h-screen">
      <div className="profile-container ">
        {/* Profile Header */}
        <div className="profile-inner_container h-1/3">
          <ProfileHeader userId={id!} />
        </div>

        <hr className="border-t border-dm-dark-4 w-[75%] mt-5 mb-1" />

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-10 mb-7">
          <Button
            className={`bg-dm-dark-2 text-dm-light hover:bg-dm-dark-2 px-4 py-2 text-base font-semibold transition ${
              activeTab === "all posts"
                ? "border-b border-dm-dark-4 rounded-none"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("all posts")}
          >
            All posts
          </Button>

          <Button
            className={`bg-dm-dark-2 text-dm-light hover:bg-dm-dark-2 px-4 py-2 text-base font-semibold transition ${
              activeTab === "itineraries"
                ? "border-b border-dm-dark-4 rounded-none"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("itineraries")}
          >
            Itineraries
          </Button>
        </div>
        {/* Posts */}
        <div className="h-2/3 w-full ">
          {activeTab === "itineraries" ? (
            <ProfilePostsGrid userId={id!} type="itineraries" />
          ) : (
            <ProfilePostsGrid userId={id!} type="all posts" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
