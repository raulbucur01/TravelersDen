import { z } from "zod";
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
import { watch } from "node:fs";
import FileUploader from "../shared/FileUploader";

type TripStepFormProps = {
  fieldName: string; // Field name for form context, e.g., "accommodations"
};

const TripStepForm = ({ fieldName }: TripStepFormProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Trip Steps</h3>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-2 border border-dm-secondary p-4 rounded"
        >
          <div className="text-sm font-medium text-dm-accent">{index + 1}.</div>

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
                    mediaUrls={[]} // Pre-fill for updates
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

          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
            className="self-end mt-2"
          >
            Remove
          </Button>
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
        + Add Step
      </Button>
    </div>
  );
};

export default TripStepForm;
