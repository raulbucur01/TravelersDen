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

export const PostValidation = z.object({
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
    .min(1, { message: "At least one file is required" })
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
