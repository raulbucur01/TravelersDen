import React, { useState } from "react";
import { ICommentCreator, IUser } from "@/types";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

type CommentFormProps = {
  currentUser: string;
  commentCreator: ICommentCreator;
  onCancel: () => void;
};

const CommentForm = ({
  currentUser,
  commentCreator,
  onCancel,
}: CommentFormProps) => {
  const [body, setBody] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting comment: ", body);
    console.log("Comment creator: ", commentCreator);
    setBody(""); // Clear the input after submission
  };

  const handleCancel = () => {
    setBody(""); // Clear the input
    onCancel(); // Call the onCancel function passed from parent to hide the form
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form space-y-1">
      <Textarea
        className="custom-scrollbar bg-dm-dark-2"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={"Add a reply..."}
        rows={4}
      />

      <div className="flex gap-2">
        <Button
          type="submit"
          className="px-4 py-2 bg-dm-dark text-dm-light hover:bg-dm-secondary rounded-md"
        >
          Send
        </Button>
        <Button
          type="button" // Type should be button to prevent form submission
          onClick={handleCancel}
          className="px-4 py-2 bg-dm-dark text-dm-light hover:bg-dm-secondary rounded-md"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
