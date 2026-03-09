import { LogOut, Globe, Sun, Moon, Monitor, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "ع" },
];

const THEME_COMBOS = [
  { sidebar: "dark" as const, dashboard: "light" as const, label: "Default", sIcon: "🌑", dIcon: "☀️" },
  { sidebar: "dark" as const, dashboard: "dark" as const, label: "Full Dark", sIcon: "🌑", dIcon: "🌑" },
  { sidebar: "light" as const, dashboard: "light" as const, label: "Full Light", sIcon: "☀️", dIcon: "☀️" },
  { sidebar: "light" as const, dashboard: "dark" as const, label: "Inverted", sIcon: "☀️", dIcon: "🌑" },
];

interface SidebarFooterProps {
  collapsed: boolean;
}

export default function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("jawda-lang", code);
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = code;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentComboIndex = THEME_COMBOS.findIndex(
    c => c.sidebar === theme.sidebar && c.dashboard === theme.dashboard
  );

  const cycleTheme = () => {
    const next = THEME_COMBOS[(currentComboIndex + 1) % THEME_COMBOS.length];
    theme.setSidebarTheme(next.sidebar);
    theme.setDashboardTheme(next.dashboard);
  };

  if (collapsed) {
    return (
      <div className="border-t border-sidebar-border/15 p-1.5 space-y-0.5">
        <button
          onClick={cycleTheme}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-all duration-200"
          title={THEME_COMBOS[currentComboIndex]?.label}
        >
          <Palette className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/30 hover:text-destructive hover:bg-destructive/8 transition-all duration-200"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-sidebar-border/15 p-3 space-y-2.5">
      {/* User card */}
      {currentUser && (
        <div className="flex items-center gap-2.5 rounded-md bg-sidebar-accent/30 px-3 py-2.5 transition-colors hover:bg-sidebar-accent/50">
          <div className="h-7 w-7 rounded-md bg-sidebar-primary/10 flex items-center justify-center shrink-0 ring-1 ring-sidebar-primary/12">
            <span className="text-[10px] font-bold text-sidebar-primary">{currentUser.avatar ?? "—"}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-sidebar-foreground/85 truncate leading-tight tracking-wide">{currentUser.name}</p>
            <p className="text-[10px] text-sidebar-foreground/35 truncate leading-tight mt-0.5 tracking-wide">{currentUser.roleLabel}</p>
          </div>
        </div>
      )}

      {/* Theme picker */}
      <div className="relative">
        <button
          onClick={() => setShowThemePicker(p => !p)}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/40 transition-all duration-200"
        >
          <Palette className="h-3 w-3" />
          <span className="flex-1 text-start">{THEME_COMBOS[currentComboIndex]?.label ?? "Theme"}</span>
          <span className="text-[10px] opacity-60">
            {THEME_COMBOS[currentComboIndex]?.sIcon}{THEME_COMBOS[currentComboIndex]?.dIcon}
          </span>
        </button>

        {showThemePicker && (
          <div className="absolute bottom-full mb-1 inset-x-0 rounded-lg border border-sidebar-border/25 bg-sidebar/95 backdrop-blur-2xl p-1 shadow-2xl z-50">
            <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/25">
              {t("nav.theme", "Theme")}
            </p>
            {THEME_COMBOS.map((combo, i) => (
              <button
                key={i}
                onClick={() => {
                  theme.setSidebarTheme(combo.sidebar);
                  theme.setDashboardTheme(combo.dashboard);
                  setShowThemePicker(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] tracking-wide transition-all duration-150",
                  i === currentComboIndex
                    ? "bg-sidebar-primary/12 text-sidebar-primary font-semibold ring-1 ring-sidebar-primary/15"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                )}
              >
                <span className="flex gap-0.5 text-[10px] shrink-0">
                  <span className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-sm text-[8px] font-bold",
                    combo.sidebar === "dark" ? "bg-sidebar-accent text-sidebar-foreground/70" : "bg-background text-foreground/70 ring-1 ring-border/50"
                  )}>S</span>
                  <span className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-sm text-[8px] font-bold",
                    combo.dashboard === "dark" ? "bg-sidebar-accent text-sidebar-foreground/70" : "bg-background text-foreground/70 ring-1 ring-border/50"
                  )}>D</span>
                </span>
                <span className="truncate">{combo.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language row */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-0.5">
          <Globe className="h-3 w-3 text-sidebar-foreground/25 me-1" />
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide transition-all duration-200",
                i18n.language === lang.code
                  ? "bg-sidebar-primary/10 text-sidebar-primary ring-1 ring-sidebar-primary/12"
                  : "text-sidebar-foreground/30 hover:text-sidebar-foreground/60"
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium tracking-wide text-sidebar-foreground/35 hover:text-destructive hover:bg-destructive/8 transition-all duration-200"
      >
        <LogOut className="h-3.5 w-3.5" />
        {t("nav.logout")}
      </button>
    </div>
  );
}
