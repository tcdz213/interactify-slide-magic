import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import WarehousesPage from "@/pages/wms/WarehousesPage";

describe("Entrepôts (Warehouses)", () => {
  it("affiche le titre de la page", () => {
    render(<WarehousesPage />);
    expect(screen.getByRole("heading", { name: /entrepôts/i })).toBeInTheDocument();
  });

  it("affiche les cartes d'entrepôts", () => {
    render(<WarehousesPage />);
    expect(screen.getByText(/alger/i)).toBeInTheDocument();
    expect(screen.getByText(/oran/i)).toBeInTheDocument();
  });

  it("affiche la capacité et l'utilisation", () => {
    render(<WarehousesPage />);
    expect(screen.getAllByText(/capacité/i).length).toBeGreaterThan(0);
  });

  it("affiche les boutons d'export", () => {
    render(<WarehousesPage />);
    const exportBtns = screen.getAllByRole("button", { name: /export/i });
    expect(exportBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("affiche la section emplacements", () => {
    render(<WarehousesPage />);
    expect(screen.getByText(/emplacements/i, { selector: "h2" })).toBeInTheDocument();
  });
});
