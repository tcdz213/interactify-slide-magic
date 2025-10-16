import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusinessSearchFilters } from "@/services/businessApi";
import { X } from "@/components/ui/icon";

interface LanguagesSectionProps {
  filters: BusinessSearchFilters;
  onFilterChange: (key: string, value: any) => void;
}

const AVAILABLE_LANGUAGES = [
  { value: "arabic", label: "Arabic", emoji: "🇸🇦" },
  { value: "english", label: "English", emoji: "🇬🇧" },
  { value: "french", label: "French", emoji: "🇫🇷" },
  { value: "urdu", label: "Urdu", emoji: "🇵🇰" },
  { value: "filipino", label: "Filipino", emoji: "🇵🇭" },
  { value: "hindi", label: "Hindi", emoji: "🇮🇳" },
  { value: "spanish", label: "Spanish", emoji: "🇪🇸" },
  { value: "chinese", label: "Chinese", emoji: "🇨🇳" },
];

const QUICK_PRESETS = [
  { label: "Arabic + English", languages: ["arabic", "english"] },
  { label: "Arabic + French", languages: ["arabic", "french"] },
  { label: "English Only", languages: ["english"] },
];

export const LanguagesSection = ({ filters, onFilterChange }: LanguagesSectionProps) => {
  const selectedLanguages = filters.languages || [];

  const toggleLanguage = (language: string) => {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter((l) => l !== language)
      : [...selectedLanguages, language];
    onFilterChange("languages", newLanguages);
  };

  const setPreset = (languages: string[]) => {
    onFilterChange("languages", languages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs sm:text-sm font-semibold">🌍 Languages</Label>
        {selectedLanguages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange("languages", [])}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => setPreset(preset.languages)}
            className="h-8 text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Language Selection */}
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguages.includes(lang.value);
          return (
            <Badge
              key={lang.value}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer h-9 px-3 text-xs hover:bg-primary/90 transition-colors"
              onClick={() => toggleLanguage(lang.value)}
            >
              <span className="mr-1">{lang.emoji}</span>
              {lang.label}
              {isSelected && <X className="ml-1 w-3 h-3" />}
            </Badge>
          );
        })}
      </div>

      {/* Selected Languages Display */}
      {selectedLanguages.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedLanguages.length} language{selectedLanguages.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
};