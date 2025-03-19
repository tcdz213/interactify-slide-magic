import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navigation/Navbar";
import Footer from "./Footer";
import Sponsors from "./Sponsors";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">{children || <Outlet />}</main>
      <Sponsors />
      <Footer />
      <Toaster />
    </div>
  );
};

export default Layout;
