import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { useDomains } from "@/hooks/use-domains";
import { useLanguage } from "@/hooks/use-language";
import { cloudinaryService } from "@/services/cloudinaryService";
import { authApi } from "@/services/authApi";

interface DomainVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationSubmitted: () => void;
}

export const DomainVerificationDialog = ({ 
  open, 
  onOpenChange, 
  onVerificationSubmitted 
}: DomainVerificationDialogProps) => {
  const { domains, isLoading: domainsLoading } = useDomains();
  const { language } = useLanguage();
  const [domainKey, setDomainKey] = useState("");
  const [subcategoryKey, setSubcategoryKey] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDomain = domains.find(d => d.key === domainKey);
  const subcategories = selectedDomain?.subcategories || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, WebP, or PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!domainKey || !subcategoryKey) {
      setError('Please select both domain and subcategory');
      return;
    }

    if (!selectedFile) {
      setError('Please upload a verification document');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Update profile with domain selection
      await authApi.updateProfile({ 
        domainKey, 
        subcategoryKey 
      });

      // Step 2: Upload document to Cloudinary
      const uploadResult = await cloudinaryService.uploadFile(selectedFile);

      // Step 3: Submit verification
      const result = await authApi.submitDomainVerification({
        domainKey,
        subcategoryKey,
        documentUrl: uploadResult.secure_url,
        documentType: selectedFile.type,
      });

      if (result.success) {
        onVerificationSubmitted();
        onOpenChange(false);
      } else {
        setError(result.error || 'Failed to submit verification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="shield" className="w-5 h-5 text-primary" />
            Domain Verification Required
          </DialogTitle>
          <DialogDescription>
            Please select your domain and subcategory, then upload a verification document before creating your card.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Domain Selection */}
          <div className="space-y-2">
            <Label htmlFor="verification-domain">Select Domain *</Label>
            <Select 
              value={domainKey} 
              onValueChange={(value) => {
                setDomainKey(value);
                setSubcategoryKey("");
              }}
              disabled={isSubmitting || domainsLoading}
            >
              <SelectTrigger id="verification-domain">
                <SelectValue placeholder="Choose your industry" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.key} value={domain.key}>
                    {domain[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory Selection */}
          <div className="space-y-2">
            <Label htmlFor="verification-subcategory">Select Subcategory *</Label>
            <Select 
              value={subcategoryKey} 
              onValueChange={setSubcategoryKey}
              disabled={isSubmitting || !domainKey || subcategories.length === 0}
            >
              <SelectTrigger id="verification-subcategory">
                <SelectValue placeholder={domainKey ? "Choose your specialization" : "Select domain first"} />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcat) => (
                  <SelectItem key={subcat.key} value={subcat.key}>
                    {subcat[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>Upload Verification Document *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-all cursor-pointer group">
              <input
                type="file"
                id="verification-document"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                disabled={isSubmitting}
              />
              <label htmlFor="verification-document" className="cursor-pointer block">
                <Icon name="upload" className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium mb-1">Click to upload document</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP, PDF • Max 10MB</p>
              </label>
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border mt-2">
                <div className="flex items-center gap-3">
                  <Icon name="image" className="w-4 h-4 text-primary" />
                  <span className="text-sm truncate">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={isSubmitting}
                >
                  <Icon name="x" className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <Icon name="alertTriangle" className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Icon name="shield" className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm">
              <p className="font-semibold mb-1">Required Documents:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Business license or registration</li>
                <li>Professional certificate or diploma</li>
                <li>Official credential document</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!domainKey || !subcategoryKey || !selectedFile || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4 mr-2" />
                  Submit Verification
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
