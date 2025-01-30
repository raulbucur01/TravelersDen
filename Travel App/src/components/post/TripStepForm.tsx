import { useFieldArray, useFormContext } from "react-hook-form";
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
import { IDisplayedTripStep } from "@/types";
import { useEffect, useState } from "react";

type TripStepFormProps = {
  fieldName: string; // Field name for form context, e.g., "accommodations"
  tripSteps?: IDisplayedTripStep[]; // when in update mode prefilled
  action?: "Create" | "Update";
  onTripStepMediaUpdate?: (
    newFiles: { [key: number]: File[] },
    deletedFiles: { [key: number]: string[] }
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

  const [newTripStepFiles, setNewTripStepFiles] = useState<{
    [key: number]: File[];
  }>({});
  const [deletedTripStepFiles, setDeletedTripStepFiles] = useState<{
    [key: number]: string[];
  }>({});

  useEffect(() => {
    if (onTripStepMediaUpdate) {
      onTripStepMediaUpdate(newTripStepFiles, deletedTripStepFiles);
    }
  }, [newTripStepFiles, deletedTripStepFiles]);

  // Prefill the form when updating
  useEffect(() => {
    if (tripSteps && tripSteps.length > 0) {
      replace(tripSteps); // Replaces the form fields with existing accommodations
    }
  }, [tripSteps, replace]);

  // console.log("newTripStepFiles", newTripStepFiles);
  // console.log("deletedTripStepFiles", deletedTripStepFiles);

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
            onClick={() => remove(index)}
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
                      mediaUrls={tripSteps?.[index]?.mediaUrls || []} // Pre-fill for updates
                      onUpdate={
                        action === "Update"
                          ? ({ newFiles, deletedFiles }) => {
                              setNewTripStepFiles((prev) => ({
                                ...prev,
                                [index]: newFiles,
                              }));
                              setDeletedTripStepFiles((prev) => ({
                                ...prev,
                                [index]: deletedFiles,
                              }));
                            }
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
                      onLocationPicked={(longitude, latitude) => {
                        setValue(`${fieldName}.${index}.longitude`, longitude);
                        setValue(`${fieldName}.${index}.latitude`, latitude);
                      }}
                      preselectedLongitude={tripSteps?.[index]?.longitude}
                      preselectedLatitude={tripSteps?.[index]?.latitude}
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
            stepNumber: 0,
            description: "",
            price: 0,
            files: [],
          })
        }
      >
        + Add Trip Step
      </Button>
    </div>
  );
};

export default TripStepForm;
