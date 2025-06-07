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
import { ItineraryPostValidation } from "@/utilities/validation";
import {
  useCreateItineraryPost,
  useGetItineraryDetails,
  useUpdateItineraryPost,
} from "@/api/tanstack-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AccommodationForm from "./AccommodationForm";
import TripStepForm from "./TripStepForm";
import { BasePost, DisplayedTripStep, GeneratedItinerary } from "@/types";
import Loader from "../shared/Loader";
import { useEffect, useState } from "react";
import { convertActivitiesAcrossAllDaysToTripSteps } from "@/utilities/utils";

type ItineraryPostFormProps = {
  post?: BasePost;
  action: "Create" | "Update";
  generatedItineraryForPrefill?: GeneratedItinerary;
};

const ItineraryPostForm = ({
  post,
  action,
  generatedItineraryForPrefill,
}: ItineraryPostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreateItineraryPost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdateItineraryPost();
  const { data: itineraryData, isPending: isGettingItineraryData } =
    useGetItineraryDetails(post?.postId ?? "", action === "Update");

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [, setNewFiles] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);

  const [, setNewTripStepFiles] = useState<File[]>([]);
  const [deletedTripStepFiles, setDeletedTripStepFiles] = useState<string[]>(
    []
  );

  const [completelyDeletedTripStepFiles, setCompletelyDeletedTripStepFiles] =
    useState<string[]>([]);

  const [tripStepsForPrefill, setTripStepsForPrefill] = useState<
    DisplayedTripStep[] | undefined
  >(undefined);

  // this useEffect is used to set the trip steps to prefill by converting all activities across all days to trip steps
  // (when we are creating a new itinerary post from a generated itinerary)
  useEffect(() => {
    const fetchTripSteps = async () => {
      if (generatedItineraryForPrefill) {
        const tripSteps = await convertActivitiesAcrossAllDaysToTripSteps(
          generatedItineraryForPrefill.days
        );

        setTripStepsForPrefill(tripSteps);
      }
    };

    fetchTripSteps();
  }, [generatedItineraryForPrefill]);

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
      caption: post?.caption ?? generatedItineraryForPrefill?.destination ?? "",
      body: post?.body ?? "",
      files: post?.mediaUrls ?? [],
      location:
        post?.location ?? generatedItineraryForPrefill?.destination ?? "",
      tags: post?.tags ?? generatedItineraryForPrefill?.destination ?? "",
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

      return navigate(`/post-details/${post.postId}`);
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

  if (
    action === "Create" &&
    generatedItineraryForPrefill &&
    !tripStepsForPrefill
  ) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="loader-spinner w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2" />
      </div>
    );
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
                  placeholder="e.g. Madrid, Exploring, Spain"
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
          <TripStepForm
            fieldName="tripSteps"
            action="Create"
            tripSteps={tripStepsForPrefill}
          />
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
            className="bg-dm-dark text-dm-light w-28 mt-6 hover:bg-dm-red"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-dm-dark text-dm-light w-28 mt-6 hover:bg-dm-secondary"
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
