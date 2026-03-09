import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import { GrnPage } from "@/pages/wms/index";

describe("Réception (GRN)", () => {
  it("renders page title", () => {
    render(<GrnPage />);
    expect(screen.getByRole("heading", { name: /réception/i })).toBeInTheDocument();
  });

  it("shows recap cards", () => {
    render(<GrnPage />);
    expect(screen.getByText(/brouillons/i)).toBeInTheDocument();
    expect(screen.getByText(/approuvés/i)).toBeInTheDocument();
  });

  it("shows table or empty state", () => {
    render(<GrnPage />);
    const emptyMsg = screen.queryByText(/aucun bon de réception/i);
    const table = document.querySelector("table");
    expect(emptyMsg ?? table).toBeTruthy();
  });
});