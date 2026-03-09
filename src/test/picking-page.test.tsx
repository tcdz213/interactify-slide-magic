import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import PickingPage from "@/pages/wms/PickingPage";

describe("Picking (Préparation)", () => {
  it("affiche le titre de la page", () => {
    render(<PickingPage />);
    expect(screen.getByRole("heading", { name: /picking|préparation/i })).toBeInTheDocument();
  });

  it("affiche le bouton créer picking", () => {
    render(<PickingPage />);
    expect(screen.getByRole("button", { name: /créer|picking/i })).toBeInTheDocument();
  });

  it("affiche le bouton d'export", () => {
    render(<PickingPage />);
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });

  it("affiche les KPI cards", () => {
    render(<PickingPage />);
    expect(screen.getByText(/commandes en picking/i)).toBeInTheDocument();
  });

  it("affiche le champ de recherche", () => {
    render(<PickingPage />);
    const input = document.querySelector("input[type='text']");
    expect(input).toBeInTheDocument();
  });
});
