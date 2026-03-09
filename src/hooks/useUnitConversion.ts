/**
 * R1/R2 — Unit Conversion Hook (Phase 0/1 hardened)
 * Bridges the unitConversion engine with product/inventory data.
 * Uses precision-safe toBaseUnits/fromBaseUnits from engine.
 */
import { useMemo, useCallback } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { toBaseUnits, fromBaseUnits, validateQuantity } from "@/lib/unitConversion";
import type { QtyValidationResult } from "@/lib/unitConversion";

export interface UnitOption {
  id: string;
  unitName: string;
  unitAbbreviation: string;
  conversionFactor: number;
  isStockUnit: boolean;
  isVirtualM2?: boolean;
  isInteger?: boolean;
  decimalPlaces?: number;
  roundingMode?: "ceil" | "floor" | "round";
  usedInTransactions?: boolean;
  lockedAt?: string;
}

export function useUnitConversion() {
  const { products, productUnitConversions, productBaseUnits, productDimensions } = useWMSData();

  /** How many base units = 1 stock unit (product.uom) */
  const getStockUnitFactor = useCallback((productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 1;
    const convs = productUnitConversions.filter(c => c.productId === productId);
    if (convs.length === 0) return 1;
    const match = convs.find(c =>
      c.unitAbbreviation === product.uom || c.unitName === product.uom
    );
    if (match) return match.conversionFactor;
    const dims = productDimensions.find(d => d.productId === productId);
    if (dims && product.uom === "m²") {
      return 1 / ((dims.widthCm / 100) * (dims.heightCm / 100));
    }
    return 1;
  }, [products, productUnitConversions, productDimensions]);

  /** Available selling/buying units for a product */
  const getUnitsForProduct = useCallback((productId: string, mode: "sell" | "buy" = "sell"): UnitOption[] => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    const conversions = productUnitConversions.filter(c => c.productId === productId);
    if (conversions.length === 0) {
      return [{ id: `default-${productId}`, unitName: product.uom, unitAbbreviation: product.uom, conversionFactor: 1, isStockUnit: true }];
    }
    const stockFactor = getStockUnitFactor(productId);
    const dims = productDimensions.find(d => d.productId === productId);

    const units: UnitOption[] = conversions
      .filter(c => mode === "sell" ? c.allowSell : c.allowBuy)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({
        id: c.id,
        unitName: c.unitName,
        unitAbbreviation: c.unitAbbreviation,
        conversionFactor: c.conversionFactor,
        isStockUnit: Math.abs(c.conversionFactor - stockFactor) < 0.001,
        isInteger: c.isInteger ?? false,
        decimalPlaces: c.decimalPlaces,
        roundingMode: c.roundingMode,
        usedInTransactions: c.usedInTransactions,
        lockedAt: c.lockedAt,
      }));

    // Add m² as virtual unit for dimensional products
    if (dims && product.uom === "m²") {
      const areaPerPiece = (dims.widthCm / 100) * (dims.heightCm / 100);
      const m2Factor = 1 / areaPerPiece;
      if (!units.find(u => u.unitAbbreviation === "m²")) {
        units.unshift({
          id: `virtual-m2-${productId}`,
          unitName: "Mètre carré",
          unitAbbreviation: "m²",
          conversionFactor: m2Factor,
          isStockUnit: true,
          isVirtualM2: true,
        });
      }
    }
    return units;
  }, [products, productUnitConversions, productDimensions, getStockUnitFactor]);

  /** Default unit (stock unit) for a product */
  const getDefaultUnit = useCallback((productId: string, mode: "sell" | "buy" = "sell"): UnitOption | null => {
    const units = getUnitsForProduct(productId, mode);
    return units.find(u => u.isStockUnit) ?? units[0] ?? null;
  }, [getUnitsForProduct]);

  /** Convert from selected unit to stock units (precision-safe) */
  const toStockUnits = useCallback((productId: string, qty: number, selectedFactor: number): number => {
    const stockFactor = getStockUnitFactor(productId);
    const baseQty = toBaseUnits(qty, selectedFactor);
    return fromBaseUnits(baseQty, stockFactor);
  }, [getStockUnitFactor]);

  /** Adjust price from stock unit to selected unit */
  const adjustPrice = useCallback((productId: string, pricePerStockUnit: number, selectedFactor: number): number => {
    const stockFactor = getStockUnitFactor(productId);
    return Math.round((pricePerStockUnit / stockFactor) * selectedFactor * 100) / 100;
  }, [getStockUnitFactor]);

  /** Get base unit abbreviation for a product */
  const getBaseUnitAbbr = useCallback((productId: string): string => {
    // Phase 0 — F-06: derive from conversions (factor=1 entry)
    const baseEntry = productUnitConversions.find(c => c.productId === productId && c.conversionFactor === 1);
    if (baseEntry) return baseEntry.unitAbbreviation;
    // Fallback to deprecated productBaseUnits
    const bu = productBaseUnits.find(b => b.productId === productId);
    return bu?.baseUnitAbbreviation ?? products.find(p => p.id === productId)?.uom ?? "";
  }, [productUnitConversions, productBaseUnits, products]);

  /** Validate quantity for a unit (integer check, positive check) */
  const validateQty = useCallback((qty: number, unit: UnitOption): QtyValidationResult => {
    return validateQuantity(qty, {
      unitName: unit.unitName,
      isInteger: unit.isInteger,
      conversionFactor: unit.conversionFactor,
    });
  }, []);

  /** Pre-computed stock factor map for all products */
  const stockFactorMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      const convs = productUnitConversions.filter(c => c.productId === p.id);
      const match = convs.find(c => c.unitAbbreviation === p.uom || c.unitName === p.uom);
      if (match) { map.set(p.id, match.conversionFactor); return; }
      const dims = productDimensions.find(d => d.productId === p.id);
      if (dims && p.uom === "m²") { map.set(p.id, 1 / ((dims.widthCm / 100) * (dims.heightCm / 100))); return; }
      map.set(p.id, 1);
    });
    return map;
  }, [products, productUnitConversions, productDimensions]);

  /** Get dimensions for a dimensional product */
  const getDimensionsForProduct = useCallback((productId: string) => {
    return productDimensions.find(d => d.productId === productId) ?? null;
  }, [productDimensions]);

  return {
    getUnitsForProduct, getStockUnitFactor, toStockUnits, getDefaultUnit,
    adjustPrice, getBaseUnitAbbr, stockFactorMap, getDimensionsForProduct,
    validateQty,
  };
}
