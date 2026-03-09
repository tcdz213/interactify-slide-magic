import { z } from "zod";

export const clientTypeSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ClientTypeFormValues = z.infer<typeof clientTypeSchema>;

export interface ClientType {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  status: "active" | "inactive";
}
