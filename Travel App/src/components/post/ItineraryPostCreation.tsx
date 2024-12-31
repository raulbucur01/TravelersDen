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
import { ItineraryPostValidation } from "@/lib/validation";
import { Models } from "appwrite";
import {
  useCreateItineraryPost,
  // useUpdatePost,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { IAccommodation } from "@/types";
import AccommodationForm from "./AccommodationForm";

type ItineraryPostCreationProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const ItineraryPostCreation = ({
  post,
  action,
}: ItineraryPostCreationProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreateItineraryPost();
  // const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
  //   useUpdatePost();
  const isLoadingUpdate = false;

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof ItineraryPostValidation>>({
    resolver: zodResolver(ItineraryPostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      body: post ? post?.body : "",
      files: [],
      location: post ? post?.location : "",
      tags: post ? post?.tags.join(",") : "",
      accommodations: post?.accommodations || [],
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof ItineraryPostValidation>) {
    // if (post && action === "Update") {
    //   const updatedPost = await updatePost({
    //     ...values,
    //     postId: post.$id,
    //     imageId: post?.imageId,
    //     imageUrl: post?.imageUrl,
    //   });

    //   if (!updatedPost) {
    //     return toast({
    //       title: "Please try again",
    //     });
    //   }

    //   return navigate(`/posts/${post.$id}`);
    // }

    // const newPost = await createPost({
    //   ...values,
    //   userId: user.userId,
    // });

    // if (!newPost) {
    //   return toast({
    //     title: "Please try again",
    //   });
    // }

    // navigate("/");

    const formattedValues = {
      ...values,
      accommodations: values.accommodations.map((accommodation) => ({
        ...accommodation,
        startDate: accommodation.startDate
          ? accommodation.startDate.toISOString()
          : null,
        endDate: accommodation.endDate
          ? accommodation.endDate.toISOString()
          : null,
      })),
    };

    // Log the formatted values
    console.log("Formatted values:", formattedValues);
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
                  className="itinerary-textarea custom-scrollbar"
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
              <FormLabel className="shad-form_label">Trip Summary</FormLabel>
              <FormControl>
                <Textarea
                  className="itinerary-textarea custom-scrollbar"
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
              <FormLabel className="shad-form_label">Cover Media</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrls={post?.mediaUrls || []} // Pre-fill for updates
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
              <FormLabel className="shad-form_label">Trip Location</FormLabel>
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

        <AccommodationForm fieldName="accommodations" />

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

export default ItineraryPostCreation;
