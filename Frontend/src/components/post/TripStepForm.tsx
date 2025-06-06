import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "../shared/FileUploader";
import Map from "../shared/map/Map";
import { DisplayedTripStep } from "@/types";
import { useEffect, useState } from "react";

type TripStepFormProps = {
  fieldName: string; // Field name for form context, e.g., "accommodations"
  tripSteps?: DisplayedTripStep[]; // when in update mode prefilled
  action?: "Create" | "Update";
  onTripStepMediaUpdate?: (
    newFiles: File[],
    deletedFiles: string[],
    completelyDeletedTripStepFiles: string[]
  ) => void;
};

const TripStepForm = ({
  fieldName,
  tripSteps,
  action,
  onTripStepMediaUpdate,
}: TripStepFormProps) => {
  const { control, setValue } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: fieldName,
  });

  const [newTripStepFiles, setNewTripStepFiles] = useState<File[]>([]);
  const [deletedTripStepFiles, setDeletedTripStepFiles] = useState<string[]>(
    []
  );
  const [completelyDeletedTripStepFiles, setCompletelyDeletedTripStepFiles] =
    useState<string[]>([]);

  const [localTripSteps, setLocalTripSteps] = useState<DisplayedTripStep[]>(
    tripSteps || []
  );

  useEffect(() => {
    if (onTripStepMediaUpdate) {
      onTripStepMediaUpdate(
        newTripStepFiles,
        deletedTripStepFiles,
        completelyDeletedTripStepFiles
      );
    }
  }, [newTripStepFiles, deletedTripStepFiles, completelyDeletedTripStepFiles]);

  // Prefill the form when updating or creating using prefilled generated tripsteps
  useEffect(() => {
    const shouldPrefill =
      (action === "Update" || action === "Create") && localTripSteps.length > 0;

    if (shouldPrefill) {
      replace(localTripSteps);
      localTripSteps.forEach((step, index) => {
        setValue(`${fieldName}.${index}.description`, step.description);
        setValue(`${fieldName}.${index}.price`, step.price.toString());
        setValue(`${fieldName}.${index}.longitude`, step.longitude);
        setValue(`${fieldName}.${index}.latitude`, step.latitude);
        setValue(`${fieldName}.${index}.zoom`, step.zoom);
      });
    }
  }, []);

  const handleMediaUpdate = (
    index: number,
    newFiles: File[],
    deletedFiles: string[]
  ) => {
    setNewTripStepFiles((prev) => {
      const existingFiles = new Set(prev || []);
      newFiles.forEach((file) => {
        if (!existingFiles.has(file)) existingFiles.add(file);
      });
      return Array.from(existingFiles);
    });

    setDeletedTripStepFiles((prev) => {
      const existingDeleted = new Set(prev || []);
      deletedFiles.forEach((file) => {
        if (!existingDeleted.has(file)) existingDeleted.add(file);
      });
      return Array.from(existingDeleted);
    });

    // Ensure form state is updated
    const updatedFiles =
      localTripSteps?.[index]?.mediaUrls?.filter(
        (media) => !deletedFiles.includes(media.url)
      ) || [];

    setValue(`tripSteps.${index}.files`, [...updatedFiles, ...newFiles]);
  };

  const handleRemove = (index: number) => {
    remove(index);

    if (localTripSteps && localTripSteps[index]?.mediaUrls) {
      const mediaUrls = localTripSteps[index].mediaUrls.map(
        (media) => media.url
      );

      setCompletelyDeletedTripStepFiles((prev) => [
        ...prev,
        ...mediaUrls.filter((url) => !prev.includes(url)), // Avoid duplicates
      ]);

      // Remove the URLs from deletedTripStepFiles
      setDeletedTripStepFiles((prev) =>
        prev.filter((url) => !mediaUrls.includes(url))
      );
    }

    // Remove from tripSteps state if it's defined
    if (localTripSteps) {
      const updatedTripSteps = localTripSteps.filter((_, i) => i !== index);
      setLocalTripSteps(updatedTripSteps);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <h3 className="text-lg font-semibold">Trip Steps</h3>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative flex flex-col gap-4 border border-dm-secondary p-4 rounded md:flex-row md:items-center"
        >
          {/* Red "X" Button */}
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleRemove(index)}
            className="absolute top-2 right-2 bg-transparent hover:bg-transparent hover:text-dm-red"
          >
            ✕
          </Button>

          <div className="top-left-index-number">{index + 1}</div>

          {/* Left Section */}
          <div className="flex-1 flex flex-col gap-4">
            <FormField
              control={control}
              name={`${fieldName}.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g., A cozy place near the beach"
                      className="itinerary-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${fieldName}.${index}.files`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">
                    Add some photos for this trip step
                  </FormLabel>
                  <FormControl>
                    <FileUploader
                      fieldChange={field.onChange}
                      mediaUrls={
                        action === "Update"
                          ? localTripSteps?.[index]?.mediaUrls
                          : []
                      } // Pre-fill for updates
                      onUpdate={
                        action === "Update"
                          ? (newFiles, deletedFiles) =>
                              handleMediaUpdate(index, newFiles, deletedFiles)
                          : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${fieldName}.${index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="shad-input appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Section */}
          <div className="flex-1 flex flex-col gap-4 md:ml-4 md:mb-7">
            <FormField
              control={control}
              name={`${fieldName}.${index}.mapLocation`}
              render={() => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Map
                      width="50vh"
                      height="50vh"
                      mapUIMode="small"
                      onLocationPicked={(longitude, latitude, zoom) => {
                        setValue(`${fieldName}.${index}.longitude`, longitude);
                        setValue(`${fieldName}.${index}.latitude`, latitude);
                        setValue(`${fieldName}.${index}.zoom`, zoom);
                      }}
                      preselectedLongitude={
                        localTripSteps?.[index]?.longitude || undefined
                      }
                      preselectedLatitude={
                        localTripSteps?.[index]?.latitude || undefined
                      }
                      preselectedZoom={
                        localTripSteps?.[index]?.zoom || undefined
                      }
                      onZoomChanged={(zoom) => {
                        setValue(`${fieldName}.${index}.zoom`, zoom);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${fieldName}.${index}.locationName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="shad-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({
            description: "",
            price: "",
            longitude: "",
            latitude: "",
            files: [],
            mediaUrls: [],
            stepNumber: fields.length + 1,
          })
        }
      >
        + Add Trip Step
      </Button>
    </div>
  );
};

export default TripStepForm;
