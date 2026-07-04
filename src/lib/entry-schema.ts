import { z } from "zod";

export const vehicleTypes = [
  "Car",
  "Truck",
  "SUV",
  "Motorcycle",
  "RV",
  "Other",
] as const;

export const projectTypes = [
  "Repair",
  "Maintenance",
  "Diagnostic",
  "Custom Build",
  "Inspection",
  "Other",
] as const;

export const partStatuses = [
  "Ordered",
  "In Transit",
  "Arrived",
  "Installed",
  "Returned",
  "N/A",
] as const;

export const laborRateTypes = ["standard", "specialty"] as const;

const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

export const partInputSchema = z.object({
  partName: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  vendor: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  partCost: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(1_000_000).optional()
  ),
  partStatus: z.preprocess(
    emptyToUndefined,
    z.enum(partStatuses).optional()
  ),
  receiptRef: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
});

export const entryInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required"),
  customerName: z.string().trim().min(1, "Customer name is required").max(200),
  customerPhone: z.preprocess(
    emptyToUndefined,
    z.string().max(30).optional()
  ),
  customerOptIn: z.boolean().optional().default(false),
  vehicleType: z.preprocess(emptyToUndefined, z.enum(vehicleTypes).optional()),
  makeModel: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  projectType: z.preprocess(emptyToUndefined, z.enum(projectTypes).optional()),
  projectDescription: z.preprocess(
    emptyToUndefined,
    z.string().max(2000).optional()
  ),
  timeSpent: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(1000).optional()
  ),
  laborRateType: z.enum(laborRateTypes).default("standard"),
  laborRate: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(1000).optional()
  ),
  customerNotes: z.preprocess(
    emptyToUndefined,
    z.string().max(4000).optional()
  ),
  scopeChangeDate: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  ),
  scopeChangeNotes: z.preprocess(
    emptyToUndefined,
    z.string().max(4000).optional()
  ),
  parts: z.array(partInputSchema).default([]),
});

export type EntryInput = z.infer<typeof entryInputSchema>;
export type PartInput = z.infer<typeof partInputSchema>;
