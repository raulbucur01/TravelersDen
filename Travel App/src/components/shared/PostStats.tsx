// import {
//   useDeleteSavedPost,
//   useGetCurrentUser,
//   useLikePost,
//   useSavePost,
// } from "@/lib/react-query/queriesAndMutations";
// import { checkIsLiked } from "@/lib/utils";
// import { Models } from "appwrite";
// import { useState, useEffect } from "react";
// import Loader from "./Loader";

// type PostStatsProps = {
//   post?: Models.Document;
//   userId: string;
// };

// const PostStats = ({ post, userId }: PostStatsProps) => {
//   const likesList = post?.likes.map((user: Models.Document) => user.$id);

//   const [likes, setLikes] = useState(likesList);
//   const [isSaved, setIsSaved] = useState(false);

//   const { mutate: likePost } = useLikePost();
//   const { mutate: savePost, isPending: isSavingPost } = useSavePost();
//   const { mutate: deleteSavedPost, isPending: isDeletingSaved } =
//     useDeleteSavedPost();

//   const { data: currentUser } = useGetCurrentUser();

//   const savedPostRecord = currentUser?.save.find(
//     (record: Models.Document) => record.post.$id === post?.$id
//   );

//   useEffect(() => {
//     setIsSaved(!!savedPostRecord); // explained 4:24
//   }, [currentUser]); // makes it change when current user changes

//   const handleLikePost = (e: React.MouseEvent) => {
//     e.stopPropagation(); // so it just works for the like button and no underlying post (if the whole post is clickable)

//     let newLikes = [...likes];

//     const hasLiked = newLikes.includes(userId);

//     if (hasLiked) {
//       newLikes = newLikes.filter((id) => id !== userId); // remove like if it is already liked
//     } else {
//       newLikes.push(userId);
//     }

//     setLikes(newLikes);
//     likePost({ postId: post?.$id || "", likesArray: newLikes });
//   };

//   const handleSavePost = (e: React.MouseEvent) => {
//     e.stopPropagation(); // so it just works for the like button and no underlying post (if the whole post is clickable)

//     if (savedPostRecord) {
//       setIsSaved(false);
//       deleteSavedPost(savedPostRecord.$id);
//     } else {
//       setIsSaved(true);
//       savePost({ postId: post?.$id || "", userId });
//     }
//   };

//   return (
//     <div className="flex justify-between items-center z-20">
//       <div className="flex gap-2 mr-5">
//         <img
//           src={
//             checkIsLiked(likes, userId)
//               ? "/assets/icons/liked.svg"
//               : "/assets/icons/like.svg"
//           }
//           alt="like"
//           width={20}
//           height={20}
//           onClick={handleLikePost}
//           className="cursor-pointer"
//         />
//         <p className="small-medium lg:base-medium">{likes.length}</p>
//       </div>

//       <div className="flex gap-2">
//         {isSavingPost || isDeletingSaved ? (
//           <Loader />
//         ) : (
//           <img
//             src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
//             alt="like"
//             width={20}
//             height={20}
//             onClick={handleSavePost}
//             className="cursor-pointer"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default PostStats;
