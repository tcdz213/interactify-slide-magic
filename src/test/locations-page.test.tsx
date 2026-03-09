import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import LocationsPage from "@/pages/wms/LocationsPage";

describe("Emplacements (Locations)", () => {
  it("affiche le titre de la page", () => {
    render(<LocationsPage />);
    expect(screen.getByRole("heading", { name: /emplacements/i })).toBeInTheDocument();
  });

  it("affiche le bouton de création", () => {
    render(<LocationsPage />);
    expect(screen.getByRole("button", { name: /nouvel emplacement/i })).toBeInTheDocument();
  });

  it("affiche le champ de recherche", () => {
    render(<LocationsPage />);
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  it("affiche la table des emplacements", () => {
    render(<LocationsPage />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("affiche la pagination", () => {
    render(<LocationsPage />);
    const p = screen.getByText((_, el) => el?.tagName === "P" && /sur/.test(el.textContent || ""));
    expect(p).toBeInTheDocument();
  });
});
