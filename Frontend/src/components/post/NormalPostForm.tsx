import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/FileUploader";
import { NormalPostValidation } from "@/lib/validation";
import {
  useCreateNormalPost,
  useUpdateNormalPost,
} from "@/api/tanstack-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { IBasePost } from "@/types";
import { useState } from "react";

type NormalPostFormProps = {
  post?: IBasePost;
  action: "Create" | "Update";
};

const NormalPostForm = ({ post, action }: NormalPostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreateNormalPost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdateNormalPost();

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);

  const handleMediaUpdate = (newFiles: File[], deletedFiles: string[]) => {
    setNewFiles(newFiles);
    setDeletedFiles(deletedFiles);

    // Ensure form state is updated
    const updatedFiles =
      post?.mediaUrls?.filter((media) => !deletedFiles.includes(media.url)) ||
      [];
    form.setValue("files", [...updatedFiles, ...newFiles]);
  };

  // 1. Define your form.
  const form = useForm<z.infer<typeof NormalPostValidation>>({
    resolver: zodResolver(NormalPostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      body: post ? post?.body : "",
      files: post ? post?.mediaUrls : [],
      location: post ? post?.location : "",
      tags: post ? post?.tags : "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof NormalPostValidation>) {
    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.postId,
        newFiles: newFiles,
        deletedFiles: deletedFiles,
        tags: values.tags ?? "", // Ensure tags is always a string
      });

      if (!updatedPost) {
        return toast({
          title: "Please try again",
        });
      }

      return navigate(`/posts/${post.postId}`);
    }

    const newPost = await createPost({
      ...values,
      userId: user.userId,
    });

    if (!newPost) {
      return toast({
        title: "Please try again",
      });
    }

    navigate("/");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Body</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrls={post?.mediaUrls || []} // Pre-fill for updates
                  onUpdate={action === "Update" ? handleMediaUpdate : undefined}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add tags, (separated by comma)
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Art, Expression, Learn"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button-dark-4"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {isLoadingCreate || isLoadingUpdate
              ? "Loading..."
              : `${action} Post`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NormalPostForm;
