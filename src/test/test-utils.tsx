import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WMSDataProvider } from "@/contexts/WMSDataContext";
import { FinancialTrackingProvider } from "@/contexts/FinancialTrackingContext";
import type { ReactElement, ReactNode } from "react";

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WMSDataProvider>
          <FinancialTrackingProvider>{children}</FinancialTrackingProvider>
        </WMSDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options });

export { customRender as render };
export * from "@testing-library/react";
