import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import "@/i18n";
import CycleCountPage from "@/pages/wms/CycleCountPage";

describe("Inventaire cyclique", () => {
  it("affiche le titre", () => {
    render(<CycleCountPage />);
    expect(screen.getByRole("heading", { name: /inventaire cyclique/i })).toBeInTheDocument();
  });

  it("affiche l'échelle d'approbation", () => {
    render(<CycleCountPage />);
    expect(screen.getByText(/échelle d'approbation/i)).toBeInTheDocument();
  });
});
