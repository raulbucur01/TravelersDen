import { z } from "zod";
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
import { DatePickerWithRange } from "../shared/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { IDisplayedAccommodation } from "@/types";
import { useEffect } from "react";

type AccommodationFormProps = {
  fieldName: string; // Field name for form context, e.g., "accommodations"
  accommodations?: IDisplayedAccommodation[]; // when in update mode prefilled
};

const AccommodationForm = ({
  fieldName,
  accommodations,
}: AccommodationFormProps) => {
  const { control, setValue } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: fieldName,
  });

  // Prefill the form when updating
  useEffect(() => {
    if (accommodations && accommodations.length > 0) {
      replace(accommodations); // Replaces the form fields with existing accommodations

      accommodations.forEach((accommodation, index) => {
        setValue(`${fieldName}.${index}.name`, accommodation.name);
        setValue(
          `${fieldName}.${index}.description`,
          accommodation.description
        );
        setValue(
          `${fieldName}.${index}.startDate`,
          accommodation.startDate ? new Date(accommodation.startDate) : null
        );
        setValue(
          `${fieldName}.${index}.endDate`,
          accommodation.endDate ? new Date(accommodation.endDate) : null
        );
        setValue(
          `${fieldName}.${index}.pricePerNight`,
          accommodation.pricePerNight.toString()
        );
        setValue(
          `${fieldName}.${index}.totalPrice`,
          accommodation.totalPrice.toString()
        );
        setValue(`${fieldName}.${index}.link`, accommodation.link);
      });
    }
  }, [accommodations, replace]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Accommodations</h3>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative flex flex-col gap-2 border border-dm-secondary p-4 rounded"
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

          <FormField
            control={control}
            name={`${fieldName}.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accommodation Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="shad-input"
                    placeholder="e.g., Hotel XYZ"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

          {/* Date Range Picker */}
          <FormField
            control={control}
            name={`${fieldName}.${index}.startDate`}
            render={() => {
              const startDate = useWatch({
                control,
                name: `${fieldName}.${index}.startDate`,
              });
              const endDate = useWatch({
                control,
                name: `${fieldName}.${index}.endDate`,
              });

              return (
                <FormItem>
                  <FormLabel>Accommodation Period</FormLabel>
                  <FormControl>
                    <DatePickerWithRange
                      className="w-full"
                      value={{ from: startDate || null, to: endDate || null }}
                      onChange={(date: DateRange | undefined) => {
                        if (date) {
                          setValue(
                            `${fieldName}.${index}.startDate`,
                            date.from || null
                          );
                          setValue(
                            `${fieldName}.${index}.endDate`,
                            date.to || null
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={control}
            name={`${fieldName}.${index}.pricePerNight`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per night</FormLabel>
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

          <FormField
            control={control}
            name={`${fieldName}.${index}.totalPrice`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price</FormLabel>
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

          <FormField
            control={control}
            name={`${fieldName}.${index}.link`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
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
            name: "",
            description: "",
            startDate: null,
            endDate: null,
            pricePerNight: 0,
            totalPrice: 0,
            link: "",
          })
        }
      >
        + Add Accommodation
      </Button>
    </div>
  );
};

export default AccommodationForm;
