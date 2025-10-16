import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/services/authApi";
import { cloudinaryService } from "@/services/cloudinaryService";
import { useDomains } from "@/hooks/use-domains";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export const ProfileDomainSelection = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainKey, setDomainKey] = useState<string>(user?.domainKey || "");
  const [subcategoryKey, setSubcategoryKey] = useState<string>(user?.subcategoryKey || "");
  
  const { domains, isLoading: domainsLoading } = useDomains();
  const { language } = useLanguage();

  const selectedDomain = useMemo(() => 
    domains.find(d => d.key === domainKey),
    [domains, domainKey]
  );

  const subcategories = useMemo(() => 
    selectedDomain?.subcategories || [],
    [selectedDomain]
  );

  useEffect(() => {
    if (user?.domainKey) setDomainKey(user.domainKey);
    if (user?.subcategoryKey) setSubcategoryKey(user.subcategoryKey);
  }, [user]);

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

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSaveDomainSelection = async () => {
    if (!domainKey || !subcategoryKey) {
      setError('Please select both domain and subcategory');
      return;
    }

    try {
      await authApi.updateProfile({ 
        domainKey, 
        subcategoryKey 
      });
      await refreshUser();
      toast({
        title: "Domain Selected",
        description: "Your domain and subcategory have been saved.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save selection');
    }
  };

  const handleSubmitVerification = async () => {
    if (!selectedFile) {
      setError('Please select a document');
      return;
    }

    if (!domainKey || !subcategoryKey) {
      setError('Please select both domain and subcategory first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadFile(selectedFile);

      // Submit verification
      const result = await authApi.submitDomainVerification({
        domainKey,
        subcategoryKey,
        documentUrl: uploadResult.secure_url,
        documentType: selectedFile.type,
      });

      if (result.success) {
        setSelectedFile(null);
        await refreshUser();
        toast({
          title: "Verification Submitted",
          description: "Your domain verification is under review. You'll be notified once it's processed.",
        });
      } else {
        setError(result.error || 'Failed to submit verification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    }

    setIsUploading(false);
  };

  const getStatusBadge = () => {
    if (!user?.verificationStatus || user.verificationStatus === 'none') return null;
    
    switch (user.verificationStatus) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-500 border-green-500/50">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-500 border-red-500/50">Rejected</Badge>;
    }
  };

  const isVerified = user?.verificationStatus === 'approved';
  const isPending = user?.verificationStatus === 'pending';
  const isRejected = user?.verificationStatus === 'rejected';

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="shield" className="w-5 h-5" />
              Professional Domain Verification
            </CardTitle>
            <CardDescription className="mt-1">
              Verify your professional credentials to unlock premium features
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isVerified && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <Icon name="checkCircle" className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              <p className="font-semibold mb-1">✓ Verified Professional</p>
              <p className="text-sm">Your credentials are verified. Create business cards with auto-filled domain information.</p>
            </AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <Icon name="clock" className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              <p className="font-semibold mb-1">Review in Progress</p>
              <p className="text-sm">Your verification document is being reviewed. You'll be notified within 24-48 hours.</p>
            </AlertDescription>
          </Alert>
        )}

        {isRejected && user?.verificationNotes && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <Icon name="xCircle" className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              <p className="font-semibold mb-1">Verification Declined</p>
              <p className="text-sm mt-1"><strong>Reason:</strong> {user.verificationNotes}</p>
              <p className="text-sm mt-2">Please upload a valid verification document below.</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Domain Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              1
            </div>
            <h3 className="text-base font-semibold">Select Your Professional Domain</h3>
          </div>

          <div className="space-y-3 pl-9">
            <div className="space-y-2">
              <Label htmlFor="profile-domain">Primary Domain</Label>
              <Select 
                value={domainKey} 
                onValueChange={(value) => {
                  setDomainKey(value);
                  setSubcategoryKey("");
                }} 
                disabled={isUploading || domainsLoading || isVerified}
              >
                <SelectTrigger id="profile-domain">
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

            <div className="space-y-2">
              <Label htmlFor="profile-subcategory">Specialization</Label>
              <Select 
                value={subcategoryKey} 
                onValueChange={setSubcategoryKey} 
                disabled={isUploading || !domainKey || subcategories.length === 0 || isVerified}
              >
                <SelectTrigger id="profile-subcategory">
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

            {!isVerified && domainKey && subcategoryKey && (
              <Button 
                onClick={handleSaveDomainSelection}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Icon name="check" className="w-4 h-4 mr-2" />
                Save Selection
              </Button>
            )}
          </div>
        </div>

        {/* Step 2: Verification Upload */}
        {domainKey && subcategoryKey && !isVerified && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  2
                </div>
                <h3 className="text-base font-semibold">Upload Verification Document</h3>
              </div>

              <div className="space-y-3 pl-9">
                <p className="text-sm text-muted-foreground">
                  Provide proof of your credentials: business license, professional certificate, diploma, or official registration document.
                </p>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-all cursor-pointer group">
                  <input
                    type="file"
                    id="profile-verification-upload"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <label htmlFor="profile-verification-upload" className="cursor-pointer block">
                    <Icon name="upload" className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium mb-1">Click to upload verification document</p>
                    <p className="text-xs text-muted-foreground">Accepted: JPG, PNG, WebP, PDF • Max size: 10MB</p>
                  </label>
                </div>
              </div>
            </div>

            {selectedFile && (
              <div className="space-y-2 pl-9">
                <Label className="text-xs text-muted-foreground">Selected Document</Label>
                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded bg-primary/10 flex items-center justify-center">
                      <Icon name="image" className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isUploading}
                    className="flex-shrink-0"
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

            <div className="pl-9">
              <Button
                onClick={handleSubmitVerification}
                disabled={!selectedFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />
                    Uploading & Submitting...
                  </>
                ) : (
                  <>
                    <Icon name="shield" className="w-4 h-4 mr-2" />
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
