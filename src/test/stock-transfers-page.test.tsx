import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import StockTransfersPage from "@/pages/wms/StockTransfersPage";

describe("Transferts de stock", () => {
  it("affiche le titre de la page", () => {
    render(<StockTransfersPage />);
    expect(screen.getByRole("heading", { name: /transferts de stock/i })).toBeInTheDocument();
  });

  it("affiche le bouton de création de transfert", () => {
    render(<StockTransfersPage />);
    expect(screen.getByRole("button", { name: /nouveau transfert/i })).toBeInTheDocument();
  });

  it("affiche les filtres de statut", () => {
    render(<StockTransfersPage />);
    expect(screen.getByRole("button", { name: /tous/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /draft/i })).toBeInTheDocument();
  });

  it("affiche le bouton d'export", () => {
    render(<StockTransfersPage />);
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });
});
