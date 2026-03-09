import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import { PaymentsPage } from "@/pages/accounting/index";

describe("Comptabilité — Encaissements", () => {
  it("affiche le titre de la page", () => {
    render(<PaymentsPage />);
    expect(screen.getByRole("heading", { name: /encaissements/i })).toBeInTheDocument();
  });

  it("affiche un tableau de paiements", () => {
    render(<PaymentsPage />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("affiche les KPI cards", () => {
    render(<PaymentsPage />);
    expect(screen.getByText(/total encaissé/i)).toBeInTheDocument();
  });
});