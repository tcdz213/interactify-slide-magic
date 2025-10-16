import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles } from "@/components/ui/icon";
import { useLanguage } from "@/hooks/use-language";
interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  smartFilterApplied: boolean;
}
export const SearchSection = ({
  searchQuery,
  onSearchChange,
  smartFilterApplied
}: SearchSectionProps) => {
  const {
    t
  } = useLanguage();
  return <section className="bg-background/50 my-4 py-2 px-3 sm:my-6 sm:py-3 sm:px-4 md:my-8 md:px-5 lg:px-6">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4 sm:w-5 sm:h-5" />
        <Input 
          placeholder={t("search_placeholder")} 
          value={searchQuery} 
          onChange={e => onSearchChange(e.target.value)} 
          className="pl-9 pr-4 py-2.5 bg-card border-border/50 rounded-lg text-sm focus-visible:ring-2 focus-visible:ring-primary focus:shadow-glow transition-all sm:pl-11 sm:py-3 sm:text-base sm:rounded-xl" 
        />
        
        {smartFilterApplied && <Badge className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent/20 text-accent-foreground border-accent/30 text-[10px] flex items-center gap-0.5 animate-fade-in px-1.5 py-0.5 sm:right-3 sm:text-xs sm:gap-1 sm:px-2 sm:py-1">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {t("auto_filtered")}
          </Badge>}
      </div>
    </section>;
};