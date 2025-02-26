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
  useGetItineraryDetails,
  useUpdateItineraryPost,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AccommodationForm from "./AccommodationForm";
import TripStepForm from "./TripStepForm";
import { IBasePost } from "@/types";
import Loader from "../shared/Loader";
import { useState } from "react";
import { set } from "date-fns";

type ItineraryPostFormProps = {
  post?: IBasePost;
  action: "Create" | "Update";
};

const ItineraryPostForm = ({ post, action }: ItineraryPostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreateItineraryPost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdateItineraryPost();
  const { data: itineraryData, isPending: isGettingItineraryData } =
    useGetItineraryDetails(post?.postId ?? "", action === "Update");

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);

  const [newTripStepFiles, setNewTripStepFiles] = useState<File[]>([]);
  const [deletedTripStepFiles, setDeletedTripStepFiles] = useState<string[]>(
    []
  );

  const [completelyDeletedTripStepFiles, setCompletelyDeletedTripStepFiles] =
    useState<string[]>([]);

  const handleMediaUpdate = (newFiles: File[], deletedFiles: string[]) => {
    setNewFiles(newFiles);
    setDeletedFiles(deletedFiles);

    // Ensure form state is updated
    const updatedFiles =
      post?.mediaUrls?.filter((media) => !deletedFiles.includes(media.url)) ||
      [];
    form.setValue("files", [...updatedFiles, ...newFiles]);
  };

  const handleTripStepMediaUpdate = (
    newFiles: File[],
    deletedFiles: string[],
    completelyDeletedTripStepFiles: string[]
  ) => {
    setNewTripStepFiles(newFiles);
    setDeletedTripStepFiles(deletedFiles);
    setCompletelyDeletedTripStepFiles(completelyDeletedTripStepFiles);
  };

  // 1. Define your form.
  const form = useForm<z.infer<typeof ItineraryPostValidation>>({
    resolver: zodResolver(ItineraryPostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      body: post ? post?.body : "",
      files: post ? post?.mediaUrls : [],
      location: post ? post?.location : "",
      tags: post ? post?.tags : "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof ItineraryPostValidation>) {
    if (post && action === "Update") {
      const formattedValues = {
        ...values,
        toDeleteFromAppwrite: [
          ...deletedFiles,
          ...deletedTripStepFiles,
          ...completelyDeletedTripStepFiles,
        ],
        accommodations: values.accommodations.map((accommodation) => ({
          ...accommodation,
          startDate: accommodation.startDate
            ? accommodation.startDate.toISOString()
            : null,
          endDate: accommodation.endDate
            ? accommodation.endDate.toISOString()
            : null,
        })),

        tripSteps: values.tripSteps.map((tripStep, index) => ({
          ...tripStep,
          stepNumber: index + 1,
        })),

        postId: post.postId,
        tags: values.tags ?? "", // Ensure tags is always a string
      };
      const updatedPost = await updatePost({
        ...formattedValues,
      });

      if (!updatedPost) {
        return toast({
          title: "Please try again",
        });
      }

      return navigate(`/posts/${post.postId}`);
    }

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

      tripSteps: values.tripSteps.map((tripStep, index) => ({
        ...tripStep,
        stepNumber: index + 1,
      })),
    };

    const newPost = await createPost({
      ...formattedValues,
      userId: user.userId,
    });

    if (!newPost) {
      return toast({
        title: "Please try again",
      });
    }

    navigate("/");
  }

  if (action === "Update" && (isGettingItineraryData || !itineraryData))
    return <Loader />;

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
                  mediaUrls={action === "Update" ? post?.mediaUrls : []} // Pre-fill for updates
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
              <FormLabel className="shad-form_label">
                Trip Location(s)
              </FormLabel>
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

        <AccommodationForm
          fieldName="accommodations"
          accommodations={itineraryData?.accommodations}
        />

        {action === "Create" ? (
          <TripStepForm fieldName="tripSteps" action="Create" />
        ) : (
          <TripStepForm
            fieldName="tripSteps"
            tripSteps={itineraryData?.tripSteps}
            action="Update"
            onTripStepMediaUpdate={handleTripStepMediaUpdate}
          />
        )}

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

export default ItineraryPostForm;
