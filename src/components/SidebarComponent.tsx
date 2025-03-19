import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCountry } from "@/contexts/CountryContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { Globe, LogOut, Moon, Settings, Sun, User, Wallet } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { countries } from "@/contexts/CountryContext";
import { ROLE_DEFINITIONS } from "@/utils/roles";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const currencyOptions = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "DZD", label: "DZD (د.ج)", symbol: "د.ج" },
];

export const SidebarComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, currentRole, user } = useAppSelector(
    (state) => state.auth
  );
  const { theme, setTheme, toggleTheme } = useTheme();
  const { currentCountry, setCountry } = useCountry();
  const [open, setOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    toast.success("You've been logged out successfully");
  };

  const handleProfileClick = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    setOpen(false);
    navigate("/settings");
  };

  const handleCountryChange = (code: string) => {
    const country = countries.find((c) => c.code === code);
    if (country) {
      setCountry(country);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {isAuthenticated && user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="font-medium text-left">
            {isAuthenticated ? "User Profile" : "Sign In"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {isAuthenticated ? (
            <>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <Badge className="mt-2 w-fit">
                  {ROLE_DEFINITIONS[currentRole]?.name}
                </Badge>
              </div>

              <Separator />

              <SidebarProvider>
                <Sidebar
                  variant="floating"
                  collapsible="none"
                  className="w-full border-none p-0"
                >
                  <SidebarContent>
                    <SidebarGroup>
                      <SidebarGroupLabel>Profile Management</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleProfileClick}>
                              <User className="h-4 w-4" />
                              <span>My Profile</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleSettingsClick}>
                              <Settings className="h-4 w-4" />
                              <span>Settings</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                      <SidebarGroupLabel>Preferences</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {/* Country Selection */}
                          <SidebarMenuItem>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                  <Globe className="h-4 w-4" />
                                  <span>{currentCountry.name}</span>
                                </SidebarMenuButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {countries.map((country) => (
                                  <DropdownMenuItem
                                    key={country.code}
                                    onClick={() =>
                                      handleCountryChange(country.code)
                                    }
                                  >
                                    {country.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>

                          {/* Currency Selection */}
                          <SidebarMenuItem>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                  <Wallet className="h-4 w-4" />
                                  <span>
                                    Currency:{" "}
                                    {
                                      currencyOptions.find(
                                        (c) => c.value === selectedCurrency
                                      )?.symbol
                                    }
                                  </span>
                                </SidebarMenuButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {currencyOptions.map((currency) => (
                                  <DropdownMenuItem
                                    key={currency.value}
                                    onClick={() =>
                                      setSelectedCurrency(currency.value)
                                    }
                                  >
                                    {currency.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>

                          {/* Theme Toggle */}
                          <SidebarMenuItem>
                            <SidebarMenuButton onClick={toggleTheme}>
                              {theme === "dark" ? (
                                <>
                                  <Sun className="h-4 w-4" />
                                  <span>Switch to Light Mode</span>
                                </>
                              ) : (
                                <>
                                  <Moon className="h-4 w-4" />
                                  <span>Switch to Dark Mode</span>
                                </>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </SidebarContent>

                  <SidebarFooter>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-4"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </SidebarFooter>
                </Sidebar>
              </SidebarProvider>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="rounded-lg border p-4 bg-card">
                  <h3 className="text-sm font-medium mb-2">Welcome</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Log in to access your account or sign up to join our
                    community.
                  </p>

                  <div className="space-y-2">
                    <Button
                      className="w-full flex items-center justify-center"
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        navigate("/login");
                      }}
                    >
                      Log in
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        navigate("/signup");
                      }}
                    >
                      Sign up
                    </Button>
                  </div>
                </div>
              </div>

              {/* Even for non-logged in users, show theme and country selection */}
              <Separator />
              <div className="space-y-4">
                <SidebarProvider>
                  <Sidebar
                    variant="floating"
                    collapsible="none"
                    className="w-full border-none p-0"
                  >
                    <SidebarContent>
                      <SidebarGroup>
                        <SidebarGroupLabel>Preferences</SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            <LanguageSwitcher />

                            {/* Country Selection */}
                            <SidebarMenuItem>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <SidebarMenuButton>
                                    <Globe className="h-4 w-4" />
                                    <span>{currentCountry.name}</span>
                                  </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {countries.map((country) => (
                                    <DropdownMenuItem
                                      key={country.code}
                                      onClick={() =>
                                        handleCountryChange(country.code)
                                      }
                                    >
                                      {country.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </SidebarMenuItem>

                            {/* Currency Selection */}
                            <SidebarMenuItem>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <SidebarMenuButton>
                                    <Wallet className="h-4 w-4" />
                                    <span>
                                      Currency:{" "}
                                      {
                                        currencyOptions.find(
                                          (c) => c.value === selectedCurrency
                                        )?.symbol
                                      }
                                    </span>
                                  </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {currencyOptions.map((currency) => (
                                    <DropdownMenuItem
                                      key={currency.value}
                                      onClick={() =>
                                        setSelectedCurrency(currency.value)
                                      }
                                    >
                                      {currency.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </SidebarMenuItem>

                            {/* Theme Toggle */}
                            <SidebarMenuItem>
                              <SidebarMenuButton onClick={toggleTheme}>
                                {theme === "dark" ? (
                                  <>
                                    <Sun className="h-4 w-4" />
                                    <span>Switch to Light Mode</span>
                                  </>
                                ) : (
                                  <>
                                    <Moon className="h-4 w-4" />
                                    <span>Switch to Dark Mode</span>
                                  </>
                                )}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarContent>
                  </Sidebar>
                </SidebarProvider>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarComponent;
