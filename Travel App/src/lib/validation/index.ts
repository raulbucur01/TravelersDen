import { z } from "zod";

export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const NormalPostValidation = z.object({
  caption: z
    .string()
    .min(5, { message: "Caption must be at least 5 characters" })
    .max(2200, { message: "Caption must be at most 2200 characters" }),
  body: z
    .string()
    .min(5, { message: "Body must be at least 5 characters" })
    .max(2200, { message: "Body must be at most 2200 characters" }),
  files: z
    .array(
      z.any({
        description: "File must be valid",
      })
    )
    // .min(1, { message: "At least one file is required" })
    .max(6, { message: "You can upload up to 6 files only" }),
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location must be at most 100 characters" }),
  tags: z
    .string()
    .min(2, { message: "Tags must be at least 2 characters" })
    .max(100, { message: "Tags must be at most 100 characters" })
    .optional(), // Tags can be optional
});

export const ItineraryPostValidation = z.object({
  caption: z
    .string()
    .min(5, { message: "Caption must be at least 5 characters" })
    .max(2200, { message: "Caption must be at most 2200 characters" }),
  body: z
    .string()
    .min(5, { message: "Body must be at least 5 characters" })
    .max(2200, { message: "Body must be at most 2200 characters" }),
  files: z
    .array(
      z.any({
        description: "File must be valid",
      })
    )
    // .min(1, { message: "At least one file is required" })
    .max(6, { message: "You can upload up to 6 files only" }),
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location must be at most 100 characters" }),
  tags: z
    .string()
    .min(2, { message: "Tags must be at least 2 characters" })
    .max(100, { message: "Tags must be at most 100 characters" })
    .optional(), // Tags can be optional
  accommodations: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, { message: "Name must be at least 2 characters" })
          .max(100, { message: "Name must be at most 100 characters" }),
        description: z
          .string()
          .min(2, { message: "Description must be at least 2 characters" })
          .max(2200, {
            message: "Description must be at most 2200 characters",
          }),
        startDate: z.date().nullable().optional(),
        endDate: z.date().nullable().optional(),
        pricePerNight: z
          .string()
          .transform((val) =>
            val ? parseFloat(parseFloat(val).toFixed(2)) : 0
          )
          .refine((val) => !isNaN(val) && val >= 0, {
            message: "Price per night must be a valid number and at least 0",
          }),
        totalPrice: z
          .string()
          .transform((val) =>
            val ? parseFloat(parseFloat(val).toFixed(2)) : 0
          )
          .refine((val) => !isNaN(val) && val >= 0, {
            message: "Total price must be a valid number and at least 0",
          }),
        link: z
          .string()
          .min(2, { message: "Link must be at least 2 characters" }),
      })
    )
    .min(1, { message: "At least one accommodation is required" }),
  tripSteps: z
    .array(
      z.object({
        stepNumber: z.number(),
        description: z
          .string()
          .min(2, { message: "Description must be at least 2 characters" })
          .max(2200, {
            message: "Description must be at most 2200 characters",
          }),
        price: z
          .string()
          .transform((val) =>
            val ? parseFloat(parseFloat(val).toFixed(2)) : 0
          )
          .refine((val) => !isNaN(val) && val >= 0, {
            message: "Price must be a valid number and at least 0",
          }),
        files: z
          .array(
            z.any({
              description: "File must be valid",
            })
          )
          .min(1, { message: "At least one file is required" })
          .max(6, { message: "You can upload up to 6 files only" }),
        longitude: z.number(),
        latitude: z.number(),
      })
    )
    .min(1, { message: "At least one trip step is required" }),
});
