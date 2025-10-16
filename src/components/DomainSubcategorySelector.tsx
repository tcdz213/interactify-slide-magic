import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { Zap } from "@/components/ui/icon";
import { domains } from "@/data/domains";
import { getDomainIcon } from "@/utils/categoryIcons";

interface DomainSubcategorySelectorProps {
  selectedDomainKey: string;
  selectedSubcategoryKey: string;
  onDomainChange: (domainKey: string) => void;
  onSubcategoryChange: (subcategoryKey: string) => void;
  isDisabled?: boolean;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  showQuickPicks?: boolean;
  quickPicksLimit?: number;
  language?: 'en' | 'ar' | 'fr';
}

/**
 * Reusable Domain and Subcategory Selector Component
 * Handles domain and subcategory selection with verification status indicators
 * 
 * @param selectedDomainKey - Currently selected domain key
 * @param selectedSubcategoryKey - Currently selected subcategory key
 * @param onDomainChange - Callback when domain changes
 * @param onSubcategoryChange - Callback when subcategory changes
 * @param isDisabled - Whether the selector is disabled
 * @param verificationStatus - User's verification status
 * @param showQuickPicks - Show quick pick buttons for popular domains
 * @param quickPicksLimit - Number of quick pick buttons to show
 * @param language - Display language (default: 'fr')
 */
export const DomainSubcategorySelector = ({
  selectedDomainKey,
  selectedSubcategoryKey,
  onDomainChange,
  onSubcategoryChange,
  isDisabled = false,
  verificationStatus = 'none',
  showQuickPicks = true,
  quickPicksLimit = 6,
  language = 'fr'
}: DomainSubcategorySelectorProps) => {
  const selectedDomain = domains.find(d => d.key === selectedDomainKey);

  const handleDomainChange = (domainKey: string) => {
    onDomainChange(domainKey);
    // Reset subcategory when domain changes
    onSubcategoryChange("");
  };

  const handleDomainToggle = (domainKey: string) => {
    const newValue = selectedDomainKey === domainKey ? "" : domainKey;
    handleDomainChange(newValue);
  };

  const getDomainLabel = (domain: typeof domains[0]) => {
    switch (language) {
      case 'ar': return domain.ar;
      case 'en': return domain.en;
      case 'fr': return domain.fr;
      default: return domain.fr;
    }
  };

  const getSubcategoryLabel = (subcategory: typeof domains[0]['subcategories'][0]) => {
    switch (language) {
      case 'ar': return subcategory.ar;
      case 'en': return subcategory.en;
      case 'fr': return subcategory.fr;
      default: return subcategory.fr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Verification Status Alerts */}
      {verificationStatus === 'approved' && selectedDomainKey && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <Icon name="checkCircle" className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-600 dark:text-green-400 text-sm">
            <strong>✓ Auto-filled from your verified profile!</strong> Your domain and subcategory are locked and pre-selected.
          </AlertDescription>
        </Alert>
      )}
      
      {verificationStatus === 'pending' && selectedDomainKey && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Icon name="clock" className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-600 dark:text-yellow-400 text-sm">
            <strong>⏳ Verification Pending</strong> Your card will be marked as pending until your domain is approved by admin.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Domain Selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Industry *</Label>
        
        {/* Quick Pick Buttons */}
        {showQuickPicks && domains.length > quickPicksLimit && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {domains.slice(0, quickPicksLimit).map(domain => (
              <Button 
                key={domain.key} 
                type="button" 
                variant={selectedDomainKey === domain.key ? "secondary" : "outline"} 
                onClick={() => handleDomainToggle(domain.key)}
                disabled={isDisabled}
                className="h-auto p-3 flex flex-col items-center space-y-2 transition-all hover:shadow-glow/20"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {getDomainIcon(domain.key)}
                </div>
                <span className="text-xs text-center leading-tight">
                  {getDomainLabel(domain)}
                </span>
              </Button>
            ))}
          </div>
        )}
        
        {/* Full Domain Selector */}
        <Select 
          value={selectedDomainKey} 
          onValueChange={handleDomainChange}
          disabled={isDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={showQuickPicks && domains.length > quickPicksLimit ? "Or select from all industries" : "Select industry..."} />
          </SelectTrigger>
          <SelectContent>
            {domains.map(domain => (
              <SelectItem key={domain.key} value={domain.key}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    {getDomainIcon(domain.key)}
                  </div>
                  <span>{getDomainLabel(domain)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory Selection */}
      {selectedDomain && (
        <div className="animate-slide-down">
          <Label htmlFor="subdomain" className="text-sm font-medium">Specialization *</Label>
          <Select
            value={selectedSubcategoryKey}
            onValueChange={onSubcategoryChange}
            disabled={isDisabled}
          >
            <SelectTrigger id="subdomain" className="mt-1">
              <SelectValue placeholder="Select your specialization..." />
            </SelectTrigger>
            <SelectContent>
              {selectedDomain.subcategories.map((subcat) => (
                <SelectItem key={subcat.key} value={subcat.key}>
                  {getSubcategoryLabel(subcat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
