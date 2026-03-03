import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import { OrdersPage } from "./index";

describe("Ventes — Commandes", () => {
  it("affiche le titre", () => {
    render(<OrdersPage />);
    expect(screen.getByRole("heading", { name: /commandes/i })).toBeInTheDocument();
  });

  it("affiche un tableau de commandes", () => {
    render(<OrdersPage />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });
});
