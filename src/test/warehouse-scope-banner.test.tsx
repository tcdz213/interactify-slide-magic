import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";

// Note: the banner renders inside AuthProvider/WMSDataProvider from test-utils.
// Default user from AuthContext mock is null, so it should render nothing.
describe("WarehouseScopeBanner", () => {
  it("renders nothing when no user is logged in", () => {
    const { container } = render(<WarehouseScopeBanner />);
    expect(container.firstChild).toBeNull();
  });
});
