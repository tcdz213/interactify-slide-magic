import React, { type ReactElement } from "react";
import { render, type RenderOptions, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { WMSDataProvider } from "@/contexts/WMSDataContext";
import { FinancialTrackingProvider } from "@/contexts/FinancialTrackingContext";
import { MemoryRouter } from "react-router-dom";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <WMSDataProvider>
          <FinancialTrackingProvider>
            {children}
          </FinancialTrackingProvider>
        </WMSDataProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { customRender as render, screen, fireEvent, waitFor, within };
