import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import QualityControlPage from "@/pages/wms/QualityControlPage";

describe("Contrôle qualité (QualityControl)", () => {
  it("affiche le titre de la page", () => {
    render(<QualityControlPage />);
    expect(screen.getByRole("heading", { name: /contrôle qualité/i })).toBeInTheDocument();
  });

  it("affiche le champ de recherche", () => {
    render(<QualityControlPage />);
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  it("affiche les KPI statistiques", () => {
    render(<QualityControlPage />);
    expect(screen.getAllByText(/en attente/i).length).toBeGreaterThan(0);
  });

  it("affiche les filtres de statut", () => {
    render(<QualityControlPage />);
    expect(screen.getByText(/tous/i)).toBeInTheDocument();
  });

  it("affiche un tableau d'inspections", () => {
    render(<QualityControlPage />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
