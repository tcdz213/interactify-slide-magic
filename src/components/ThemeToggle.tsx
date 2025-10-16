import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { useTheme } from "@/hooks/use-theme"
import { useLanguage } from "@/hooks/use-language"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative transition-transform min-h-[2.5rem] min-w-[2.5rem]"
          aria-label={t("theme")}
          aria-haspopup="menu"
        >
          <Icon
            name="sun"
            className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            aria-hidden="true"
          />
          <Icon
            name="moon"
            className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            aria-hidden="true"
          />
          <span className="sr-only">{t("theme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]" role="menu">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          onKeyDown={(e) => e.key === "Enter" && setTheme("light")}
          className="cursor-pointer"
          role="menuitem"
          aria-label="Switch to light theme"
        >
          <Icon name="sun" className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{t("light")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          onKeyDown={(e) => e.key === "Enter" && setTheme("dark")}
          className="cursor-pointer"
          role="menuitem"
          aria-label="Switch to dark theme"
        >
          <Icon name="moon" className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{t("dark")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}