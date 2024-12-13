import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useCreateComment } from "@/lib/react-query/queriesAndMutations";

type CommentFormProps = {
  currentUserId: string;
  postId: string;
  parentCommentId?: string;
  mention?: string;
  mentionedUserId?: string;
  onCancel: () => void;
};

const CommentForm = ({
  currentUserId,
  postId,
  parentCommentId,
  mention,
  mentionedUserId,
  onCancel,
}: CommentFormProps) => {
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateComment();

  const [body, setBody] = useState(mention ? `@${mention}` : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBody = body.replace(`@${mention}`, "").trim(); // Remove mention and trim

    // Check if there's a body left after removing the mention
    if (newBody === "") {
      return;
    }

    const finalMention = body.startsWith(`@${mention}`) ? "@" + mention : null;

    const commentData = {
      userId: currentUserId,
      postId: postId,
      body: newBody,
      parentCommentId: parentCommentId || null, // Parent is null if it's a top-level comment
      mention: finalMention,
      mentionedUserId: mentionedUserId || null,
    };

    createComment(commentData); // Pass the data directly to the API call

    setBody(""); // Clear the input after submission
    onCancel();
  };

  const handleCancel = () => {
    setBody(""); // Clear the input
    onCancel(); // Call the onCancel function passed from parent to hide the form
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);

    // Adjust textarea height based on content
    e.target.style.height = "auto"; // Reset height to auto to calculate the correct height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set the height to match the scrollHeight
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      {/* Wrapper div for Textarea and Buttons */}
      <div className="bg-dm-dark-2 flex flex-col rounded-[30px] p-4 space-y-1 border border-dm-secondary">
        {/* Textarea */}
        <Textarea
          className="custom-scrollbar bg-dm-dark-2 text-dm-light placeholder:text-dm-dark-4 flex-grow border-none focus:outline-none focus:ring-0 resize-none overflow-hidden"
          value={body}
          onChange={handleInputChange} // Use handleInputChange to adjust height
          placeholder={"Add a reply..."}
          rows={0} // Initial height
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={!body} // Disable when body is empty
            className={`px-4 py-2 rounded-[50px] transition ${
              body
                ? "cursor-pointer bg-dm-dark-3 text-dm-light hover:bg-dm-secondary"
                : "cursor-default bg-dm-dark-3 text-dm-dark-4 hover:bg-dm-dark-3"
            }`}
          >
            {isCreatingComment ? "Replying..." : "Reply"}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-dm-dark-3 text-dm-light hover:bg-dm-red rounded-[50px]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
