import { z } from "zod";

export const ElectionValidators = z
  .object({
    title: z.string().min(1, { message: "Title is required." }),
    description: z
      .string()
      .min(1, { message: "Description is required." })
      .max(1000, { message: "Description must be less than 1000 characters." }),
    startDate: z.coerce
      .date({
        required_error: "Start date is required.",
        invalid_type_error: "Start date must be a valid date.",
      })
      .min(new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Start date must be today or in the future.",
      }),
    endDate: z.coerce.date({
      required_error: "End date is required.",
      invalid_type_error: "End date must be a valid date.",
    }),
    positions: z
      .array(z.string().min(1, { message: "Position name cannot be empty." }))
      .min(1, { message: "At least one position is required." })
      .max(20, { message: "Maximum 20 positions allowed per election." }),
    type: z.string().min(1, { message: "Type is required." }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after the start date.",
    path: ["endDate"],
  });

export const PartylistValidators = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .max(3000, { message: "Description must be less than 3000 characters." })
    .optional(),
  logo: z.string().min(1, { message: "Logo is required." }),
});

export const CandidateValidators = z.object({
  userId: z.string().min(1, { message: "User is required." }),
  position: z.string().min(1, { message: "Position is required." }),
  partyId: z.string().min(1, { message: "Party is required." }).optional(),
  electionId: z.string().min(1, { message: "Election is required." }),
  platform: z.string().min(1, { message: "Platform is required." }),
  imageUrl: z.string().optional(),
});
