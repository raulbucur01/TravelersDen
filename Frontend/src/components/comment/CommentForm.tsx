import React, { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  useCreateComment,
  useEditComment,
} from "@/api/tanstack-query/queriesAndMutations";

type CommentFormProps = {
  currentUserId: string;
  postId: string;

  // for reply
  parentCommentId?: string;
  mention?: string;
  mentionedUserId?: string;

  // for edit mode
  editMode?: boolean;
  previousBody?: string;
  editedCommentId?: string;
  onCancel: () => void;
};

// handles the creation of a comment and the editing of a comment
const CommentForm = ({
  currentUserId,
  postId,
  parentCommentId,
  mention,
  mentionedUserId,
  editMode,
  previousBody,
  editedCommentId,
  onCancel,
}: CommentFormProps) => {
  const { mutateAsync: createComment, isPending: isCreatingComment } =
    useCreateComment();

  const { mutateAsync: editComment, isPending: isEditingComment } =
    useEditComment();

  // if not editing we show the mention first in the body, else we show the the previous mention + previous body
  const [body, setBody] = useState(
    !editMode ? (mention ? `@${mention}` : "") : mention + " " + previousBody
  );
  const bodyContainsOnlyMention =
    body.trim() === `@${mention}` || body.trim() === `${mention}`;
  const previousBodyUnchanged = mention + " " + previousBody === body;

  // Automatically adjust the height of the textarea when editing
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to calculate the correct height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height
    }
  }, [body]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editMode) {
      const newBody = body.replace(`@${mention}`, ""); // remove mention from body

      // Check if there's a body left after removing the mention
      if (newBody === "") {
        return;
      }

      const finalMention = body.startsWith(`@${mention}`)
        ? "@" + mention
        : null;

      const commentData = {
        userId: currentUserId,
        postId: postId,
        body: newBody.trimStart(),
        parentCommentId: parentCommentId || null, // Parent is null if it's a top-level comment
        mention: finalMention,
        mentionedUserId: (finalMention && mentionedUserId) || null,
      };

      createComment(commentData); // Pass the data directly to the API call
    } else {
      const newBody = body.replace(`${mention}`, ""); // remove mention from body

      // Check if there's a body left after removing the mention
      if (newBody === "") {
        return;
      }

      const finalMention = body.startsWith(`${mention}`) ? mention : null;

      const editedCommentData = {
        commentId: editedCommentId!,
        body: newBody.trimStart(),
        mention: finalMention,
        mentionedUserId: (finalMention && mentionedUserId) || null,
      };
      editComment(editedCommentData); // Pass the data directly to the API call
    }

    setBody(""); // Clear the input after submission
    onCancel();
  };

  const handleCancel = () => {
    setBody(""); // Clear the input
    onCancel(); // Call the onCancel function passed from parent to hide the form
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form mr-5">
      {/* Wrapper div for Textarea and Buttons */}
      <div className="bg-dm-dark-2 flex flex-col rounded-[30px] p-4 space-y-1 border border-dm-secondary">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          className="bg-dm-dark-2 text-dm-light max-h-6 placeholder:text-dm-dark-4 flex-grow border-none focus:outline-none focus:ring-0 resize-none overflow-hidden"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={"Add a reply..."}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={!body || bodyContainsOnlyMention || previousBodyUnchanged} // Disable when body is empty
            className={`px-4 py-2 w-20 rounded-[50px] transition ${
              body
                ? "cursor-pointer bg-dm-dark-3 text-dm-light hover:bg-dm-secondary"
                : "cursor-default bg-dm-dark-3 text-dm-light hover:bg-dm-dark-3"
            }`}
          >
            {!editMode
              ? isCreatingComment
                ? "Replying..."
                : "Reply"
              : isEditingComment
              ? "Saving..."
              : "Save"}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 w-20 bg-dm-dark-3 text-dm-light hover:bg-dm-red rounded-[50px]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
