import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { useLanguage } from "@/hooks/use-language"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative active:scale-95 transition-transform min-h-[2.5rem] min-w-[2.5rem]"
          aria-label={t("language")}
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <Icon name="languages" className="h-4 w-4" />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]" role="menu">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")} 
          onKeyDown={(e) => e.key === "Enter" && setLanguage("en")}
          className="cursor-pointer"
          data-active={language === "en"}
          role="menuitem"
          aria-label="Switch to English"
        >
          <Icon name="globe" className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{t("english")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("fr")} 
          onKeyDown={(e) => e.key === "Enter" && setLanguage("fr")}
          className="cursor-pointer"
          data-active={language === "fr"}
          role="menuitem"
          aria-label="Passer au français"
        >
          <Icon name="globe" className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{t("french")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("ar")} 
          onKeyDown={(e) => e.key === "Enter" && setLanguage("ar")}
          className="cursor-pointer"
          data-active={language === "ar"}
          role="menuitem"
          aria-label="التبديل إلى العربية"
        >
          <Icon name="globe" className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{t("arabic")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}