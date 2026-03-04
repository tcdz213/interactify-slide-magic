import { z } from "zod";

export const productUnitSchema = z.object({
  unitName: z.string().min(1, "Nom requis"),
  unitAbbreviation: z.string().min(1, "Abréviation requise").max(10),
  conversionToBase: z.coerce.number().positive("Facteur doit être > 0"),
  allowBuy: z.boolean(),
  allowSell: z.boolean(),
});

export type ProductUnitFormValues = z.infer<typeof productUnitSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Nom requis (min 2 caractères)"),
  sku: z.string().min(3, "SKU requis (min 3 caractères)").regex(/^[A-Za-z0-9\-_]+$/, "SKU: lettres, chiffres, tirets et underscores uniquement"),
  category: z.string().min(1, "Catégorie requise"),
  subcategoryId: z.string().optional(),
  uom: z.string().min(1, "Unité requise"),
  baseUnitId: z.string().optional(),
  unitCost: z.coerce.number().min(0, "Coût doit être ≥ 0").optional(),
  unitPrice: z.coerce.number().min(0, "Prix doit être ≥ 0").optional(),
  reorderPoint: z.coerce.number().min(0, "Seuil doit être ≥ 0").optional(),
  isActive: z.boolean(),
  // ERP purchasing fields
  productType: z.enum(["Storable", "Consumable", "Service"]).optional(),
  canBePurchased: z.boolean().optional(),
  canBeSold: z.boolean().optional(),
  costMethod: z.enum(["Standard", "Average", "FIFO"]).optional(),
  purchaseUomId: z.string().optional(),
  taxScheduleId: z.string().optional(),
  expenseAccountId: z.string().optional(),
  defaultVendorId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
