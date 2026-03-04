// Sprint 4: Product History / Audit Trail types and state

export interface ProductHistory {
  id: string;
  productId: string;
  action: "created" | "modified" | "deleted" | "undeleted" | "cloned";
  changedFields?: Record<string, { oldValue: any; newValue: any }>;
  changedBy: string;
  changedAt: string; // ISO8601
  reason?: string;
}
