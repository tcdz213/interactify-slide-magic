import { useLanguage } from "@/hooks/use-language";
import { useDomains } from "@/hooks/use-domains";
import { cities } from "@/data/cities";
import { Link } from "react-router-dom";

export const SEOFooterTicker = () => {
  const { language } = useLanguage();
  const { domains } = useDomains();

  // Helper to get text in current language
  const getText = (item: { fr: string; ar: string; en?: string }) => {
    if (language === 'ar') return item.ar;
    if (language === 'fr') return item.fr;
    return item.en || item.fr;
  };

  // Combine all items for the ticker
  const tickerItems = [
    ...domains.flatMap(domain => [
      { type: 'category', text: getText(domain) },
      ...domain.subcategories.map(sub => ({
        type: 'subcategory',
        text: getText(sub)
      }))
    ]),
    ...cities.map(city => ({
      type: 'city',
      text: getText(city)
    }))
  ];

  // Duplicate items for seamless loop
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <footer className="w-full bg-muted/30 border-t border-border/50 py-4 overflow-hidden">
      <div className="relative flex">
        <div className="flex animate-scroll-left gap-6 whitespace-nowrap">
          {duplicatedItems.map((item, index) => (
            <Link
              key={index}
              to={`/home?search=${encodeURIComponent(item.text)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-accent hover:scale-105 active:scale-95"
            >
              {item.type === 'category' && (
                <span className="text-primary">📁</span>
              )}
              {item.type === 'subcategory' && (
                <span className="text-muted-foreground">•</span>
              )}
              {item.type === 'city' && (
                <span className="text-accent-foreground">📍</span>
              )}
              <span className="text-foreground/80">{item.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
