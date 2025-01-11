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
import { DatePickerWithRange } from "../shared/DatePickerWithRange";
import { DateRange } from "react-day-picker";

type AccommodationFormProps = {
  fieldName: string; // Field name for form context, e.g., "accommodations"
};

const AccommodationForm = ({ fieldName }: AccommodationFormProps) => {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

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
            render={() => (
              <FormItem>
                <FormLabel>Accommodation Period</FormLabel>
                <FormControl>
                  <DatePickerWithRange
                    className="w-full"
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
            )}
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
