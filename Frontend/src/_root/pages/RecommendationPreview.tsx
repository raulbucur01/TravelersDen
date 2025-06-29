import {
  getRecentPosts,
  getSimilarPosts,
  getSimilarUsers,
  getUserPosts,
} from "@/api/api";
import { SimilarUser } from "@/types";
import { useEffect, useState } from "react";

interface Post {
  postId: string;
  caption: string;
  body: string;
}

const demoUsers = [
  { id: "0f8d5b36-f8d2-41d8-b93d-7dc02f93e7a8", name: "Raul Bucur" },
  { id: "76661916-14c0-45fd-90e1-cf803f4d35e8", name: "Charles Martin" },
  { id: "f5bb8075-a745-4983-add3-79cf3f4f2dda", name: "Emma Godfrey" },
  { id: "f5bb8075-a745-4983-add3-79cf3f4f2dda", name: "Copy Copy" },
  { id: "d0aa559d-9f79-436d-833c-733136661ddf", name: "Copy Copying Copy" },
  { id: "c74bc9a4-3b97-482c-a450-72fed226af55", name: "Coffee Drinker" },
  { id: "422125d0-b7ff-4833-b221-25bca436bcbf", name: "Daniel Garcia" },
];

type TabType = "posts" | "users";

export default function RecommendationDemo() {
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [similarPosts, setSimilarPosts] = useState<Post[]>([]);

  const [leftUserId, setLeftUserId] = useState<string | null>(null);
  const [rightUserId, setRightUserId] = useState<string | null>(null);
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [leftUserPosts, setLeftUserPosts] = useState<Post[]>([]);
  const [rightUserPosts, setRightUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (activeTab === "posts") {
      const fetchAllRecentPosts = async () => {
        let allPosts: Post[] = [];
        allPosts.push({
          postId: "ed861857-26ce-4b99-82ec-30d5af08b5a5",
          caption: "How much money would you need for a 3day trip in Bucharest",
          body: "Not including hotel room . Just for food , night life, bus tickets etc.",
        });
        for (let i = 1; i <= 2; i++) {
          const data = await getRecentPosts({ pageParam: i });
          if (data?.posts) {
            allPosts = [...allPosts, ...data.posts];
          }
        }
        setPosts(allPosts);
      };

      fetchAllRecentPosts();
    }
  }, [activeTab]);

  const handlePostClick = async (postId: string) => {
    setSelectedPostId(postId);
    const data = await getSimilarPosts(postId);
    console.log(data);
    if (Array.isArray(data)) {
      setSimilarPosts(data);
    } else {
      setSimilarPosts([]);
    }
  };

  useEffect(() => {
    const fetchLeftUserPostsAndSimilar = async () => {
      if (!leftUserId) return;
      try {
        const [postsRes, similarUsersRes] = await Promise.all([
          getUserPosts({ userId: leftUserId }),
          getSimilarUsers(leftUserId),
        ]);
        setLeftUserPosts(postsRes?.posts.slice(0, 5) || []);
        setSimilarUsers(similarUsersRes || []);
        setRightUserId(null); // reset right user on left change
        setRightUserPosts([]);
      } catch (err) {
        console.error("Error fetching left user data", err);
      }
    };
    fetchLeftUserPostsAndSimilar();
  }, [leftUserId]);

  useEffect(() => {
    const fetchRightUserPosts = async () => {
      if (!rightUserId) return;
      try {
        const postsRes = await getUserPosts({ userId: rightUserId });
        setRightUserPosts(postsRes?.posts.slice(0, 5) || []);
      } catch (err) {
        console.error("Error fetching right user posts", err);
      }
    };
    fetchRightUserPosts();
  }, [rightUserId]);

  return (
    <div className="flex flex-col h-screen">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "posts" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "users" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        <div className="flex flex-1 h-full">
          {/* Left side - List of recent posts */}
          <div className="w-1/2 overflow-y-auto p-4 border-r border-dm-dark-3 custom-scrollbar">
            <h2 className="text-xl font-bold mb-4">Recent posts</h2>
            <ul className="space-y-4">
              {posts.map((post) => (
                <li
                  key={post.postId}
                  className="border-dm-dark-3 border p-3 rounded cursor-pointer hover:bg-dm-secondary"
                  onClick={() => handlePostClick(post.postId)}
                >
                  <p className="text-sm text-dm-light-3">ID: {post.postId}</p>
                  <h3 className="font-semibold">{post.caption}</h3>
                  <p className="text-sm">{post.body}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side - Similar posts */}
          <div className="w-1/2 overflow-y-auto p-4 custom-scrollbar">
            <h2 className="text-xl font-bold mb-4">
              {selectedPostId
                ? `Similarity demo for post: ${selectedPostId}`
                : "Select a post"}
            </h2>
            <ul className="space-y-4">
              {similarPosts.map((post) => (
                <li
                  key={post.postId}
                  className="border border-dm-dark-3 p-3 rounded"
                >
                  <p className="text-sm text-dm-light-3">ID: {post.postId}</p>
                  <h3 className="font-semibold">{post.caption}</h3>
                  <p className="text-sm">{post.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden">
          {/* Dropdown bar */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-dm-dark-3">
            <select
              className="border border-dm-dark-4 p-2 rounded bg-dm-dark-2 text-dm-light w-[280px] truncate"
              value={leftUserId || ""}
              onChange={(e) => setLeftUserId(e.target.value)}
            >
              <option value="" disabled>
                Choose
              </option>
              {demoUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            <select
              className="border border-dm-dark-4 p-2 rounded bg-dm-dark-2 text-dm-light w-[280px] truncate"
              value={rightUserId || ""}
              onChange={(e) => setRightUserId(e.target.value)}
              disabled={!similarUsers.length}
            >
              <option value="" disabled>
                {similarUsers.length
                  ? "Choose a similar user"
                  : "Choose a user from the left"}
              </option>
              {similarUsers.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main content section */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left side */}
            <div className="w-1/2 flex flex-col min-h-0">
              <div className="p-4 overflow-y-scroll flex-1 custom-scrollbar">
                <h2 className="text-xl font-semibold mb-2">
                  Posts for selected user
                </h2>
                <ul className="space-y-4 w-[640px] max-w-full">
                  {leftUserPosts.map((post) => (
                    <li
                      key={post.postId}
                      className="border border-dm-dark-3 p-3 rounded break-words"
                    >
                      <h4 className="font-semibold truncate">{post.caption}</h4>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {post.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px bg-dm-accent" />

            {/* Right side */}
            <div className="w-1/2 flex flex-col min-h-0">
              <div className="p-4 overflow-y-scroll flex-1 custom-scrollbar">
                <h2 className="text-xl font-semibold mb-2">
                  Posts for similar user to selected one
                </h2>
                <ul className="space-y-4 w-[940px] max-w-full">
                  {rightUserPosts.map((post) => (
                    <li
                      key={post.postId}
                      className="border border-dm-dark-3 p-3 rounded break-words"
                    >
                      <h4 className="font-semibold truncate">{post.caption}</h4>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {post.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
