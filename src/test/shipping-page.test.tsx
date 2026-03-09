import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import ShippingPage from "@/pages/wms/ShippingPage";

describe("Expédition (Shipping)", () => {
  it("affiche le titre de la page", () => {
    render(<ShippingPage />);
    expect(screen.getByRole("heading", { name: /expédition/i })).toBeInTheDocument();
  });

  it("affiche le champ de recherche", () => {
    render(<ShippingPage />);
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  it("affiche les KPI statistiques", () => {
    render(<ShippingPage />);
    expect(screen.getByText(/à expédier/i)).toBeInTheDocument();
  });

  it("affiche le bouton d'export", () => {
    render(<ShippingPage />);
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });

  it("affiche un tableau des expéditions", () => {
    render(<ShippingPage />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
