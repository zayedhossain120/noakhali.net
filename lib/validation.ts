import { z } from "zod";

export const CATEGORIES = [
  "Road",
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Public Safety",
  "Other",
] as const;

export const complaintInputSchema = z.object({
  reporterName: z.string().trim().max(120).optional().or(z.literal("")),
  reporterContact: z.string().trim().max(120).optional().or(z.literal("")),
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(150),
  category: z.string().trim().min(1, "Please select a category"),
  area: z.string().trim().min(2, "Please enter an area / ward").max(100),
  description: z
    .string()
    .trim()
    .min(20, "Please describe the issue in at least 20 characters")
    .max(5000),
  // Honeypot field — real users never fill this in.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ComplaintInput = z.infer<typeof complaintInputSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const adminCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).default("ADMIN"),
});

export const STATUS_VALUES = [
  "PENDING",
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
] as const;

export const PUBLIC_STATUS_VALUES = ["OPEN", "UNDER_REVIEW", "RESOLVED"] as const;
