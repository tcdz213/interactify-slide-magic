import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { verificationApi, type VerificationRequest } from "@/services/verificationApi";
import { cloudinaryService } from "@/services/cloudinaryService";
import { useDomains } from "@/hooks/use-domains";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

interface VerificationUploadProps {
  onSuccess?: () => void;
}

export const VerificationUpload = ({ onSuccess }: VerificationUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainId, setDomainId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  
  const { user, refreshUser } = useAuth();
  const { domains, isLoading: domainsLoading } = useDomains();
  const { language } = useLanguage();

  const selectedDomain = useMemo(() => 
    domains.find(d => d.key === domainId),
    [domains, domainId]
  );

  const subcategories = useMemo(() => 
    selectedDomain?.subcategories || [],
    [selectedDomain]
  );

  useEffect(() => {
    // Set domain and subcategory from user profile if available
    if (user?.domainKey) setDomainId(user.domainKey);
    if (user?.subcategoryKey) setSubcategoryId(user.subcategoryKey);
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file types (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, WebP, or PDF files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a document');
      return;
    }

    if (!domainId) {
      setError('Please select a domain');
      return;
    }

    if (!subcategoryId) {
      setError('Please select a subcategory');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload to Cloudinary first
      const uploadResult = await cloudinaryService.uploadFile(selectedFile);

      // Submit domain verification
      const result = await verificationApi.submitDomainVerification({
        domain_key: domainId,
        subcategory_key: subcategoryId,
        document_url: uploadResult.secure_url,
        document_type: selectedFile.type,
      });

      if (result.success) {
        setSelectedFile(null);
        await refreshUser(); // Refresh user profile to get updated verification status
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to submit verification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    }

    setIsUploading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-500 border-green-500/50">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-500 border-red-500/50">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="shield" className="w-5 h-5" />
            Provider Verification
          </CardTitle>
          {user?.verificationStatus && getStatusBadge(user.verificationStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.verificationStatus === 'approved' && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <Icon name="checkCircle" className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Your account has been verified!
            </AlertDescription>
          </Alert>
        )}

        {user?.verificationStatus === 'pending' && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <Icon name="clock" className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              Your verification is under review. We'll notify you once it's processed.
            </AlertDescription>
          </Alert>
        )}

        {user?.verificationStatus === 'rejected' && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <Icon name="xCircle" className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              <p className="font-medium">Verification rejected</p>
              {user?.verificationNotes && (
                <p className="text-sm mt-1">{user.verificationNotes}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {(!user?.verificationStatus || user?.verificationStatus === 'none' || user?.verificationStatus === 'rejected') && (
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To verify your business, you must select one domain, one subcategory, and upload a verification document.
              </p>

              {/* Domain Selection */}
              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Select 
                  value={domainId} 
                  onValueChange={(value) => {
                    setDomainId(value);
                    setSubcategoryId(""); // Reset subcategory when domain changes
                  }} 
                  disabled={isUploading || domainsLoading}
                >
                  <SelectTrigger id="domain">
                    <SelectValue placeholder="Select a domain" />
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
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select 
                  value={subcategoryId} 
                  onValueChange={setSubcategoryId} 
                  disabled={isUploading || !domainId || subcategories.length === 0}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder={domainId ? "Select a subcategory" : "Select a domain first"} />
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

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Verification Document *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="verification-upload"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <label htmlFor="verification-upload" className="cursor-pointer">
                    <Icon name="upload" className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload document</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, or PDF (max 10MB)</p>
                  </label>
                </div>
              </div>

              {selectedFile && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected file:</p>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon name="image" className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={isUploading}
                    >
                      <Icon name="x" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <Icon name="alertTriangle" className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-600 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || !domainId || !subcategoryId || isUploading}
                className="w-full bg-gradient-primary"
              >
                {isUploading ? (
                  <>
                    <Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icon name="send" className="w-4 h-4 mr-2" />
                    Submit for Verification
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
