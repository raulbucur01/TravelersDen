import { useState } from "react";
import NormalPostForm from "@/components/post/NormalPostForm";
import ItineraryPostForm from "@/components/post/ItineraryPostForm";

const CreatePost = () => {
  const [activeTab, setActiveTab] = useState("normal");

  return (
    <div className="flex flex-1 justify-center min-h-screen">
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
            Create Post
          </h2>
        </div>

        {/* Message to Choose Post Type */}
        <div className="text-center">
          <p className="text-dm-dark-4 text-md">Select a post type:</p>
        </div>

        {/* Tabs */}
        <div className="w-full flex justify-center">
          <div className="flex gap-10">
            <button
              onClick={() => setActiveTab("normal")}
              className={`py-2 px-10 text-center rounded-lg ${
                activeTab === "normal"
                  ? "bg-dm-secondary text-dm-light font-bold shadow-md border-b-2 border-dm-dark-4"
                  : "bg-dm-dark text-dm-light hover:bg-dm-secondary"
              }`}
            >
              Normal Post
            </button>
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`py-2 px-10 text-center rounded-lg ${
                activeTab === "itinerary"
                  ? "bg-dm-secondary text-dm-light font-bold shadow-md border-b-2 border-dm-dark-4"
                  : "bg-dm-dark text-dm-light hover:bg-dm-secondary"
              }`}
            >
              Itinerary Post
            </button>
          </div>
        </div>

        {/* Conditional Rendering Based on Active Tab */}
        <div className="flex justify-center items-center w-full bg-dm-dark-2 p-4 rounded-b-lg">
          {activeTab === "normal" && <NormalPostForm action="Create" />}
          {activeTab === "itinerary" && <ItineraryPostForm action="Create" />}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
