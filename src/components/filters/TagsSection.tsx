import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";

interface TagsSectionProps {
  filters: BusinessSearchFilters;
  onFilterChange: (key: string, value: any) => void;
}

export const TagsSection = ({ filters, onFilterChange }: TagsSectionProps) => {
  const [currentTag, setCurrentTag] = useState("");

  const addTag = () => {
    const trimmedTag = currentTag.trim();
    
    // Validate tag
    if (!trimmedTag) return;
    if (trimmedTag.length > 50) {
      console.warn('Tag too long, max 50 characters');
      return;
    }
    
    const currentTags = filters.tags || [];
    
    // Check for duplicates (case-insensitive)
    const isDuplicate = currentTags.some(t => t.toLowerCase() === trimmedTag.toLowerCase());
    if (isDuplicate) {
      console.log('Tag already exists');
      return;
    }
    
    // Add tag (ensure array is properly formatted for API)
    const newTags = [...currentTags, trimmedTag];
    console.log('🏷️ TagsSection: Adding tag, new tags array:', newTags);
    onFilterChange("tags", newTags);
    setCurrentTag("");
  };

  const removeTag = (tag: string) => {
    const newTags = (filters.tags || []).filter(t => t !== tag);
    console.log('🗑️ TagsSection: Removing tag, new tags array:', newTags);
    onFilterChange("tags", newTags.length > 0 ? newTags : []);
  };

  return (
    <div className="space-y-2.5">
      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
        <span className="text-base sm:text-lg">#️⃣</span>
        Tags (Optional)
      </Label>
      <div className="flex gap-1.5 sm:gap-2">
        <Input
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTag()}
          placeholder="e.g., 24/7, Toyota..."
          className="flex-1 bg-background/50 text-xs sm:text-sm h-11"
        />
        <Button
          type="button"
          size="icon"
          onClick={addTag}
          disabled={!currentTag.trim()}
          className="h-11 w-11 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {filters.tags && filters.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20 transition-colors text-xs sm:text-sm py-1.5 px-2.5 active:scale-95"
              onClick={() => removeTag(tag)}
            >
              {tag}
              <X className="w-3 h-3 ml-1.5" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
