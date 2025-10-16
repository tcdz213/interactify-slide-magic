import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import BusinessCard from "@/components/BusinessCard";
import { BackButton } from "@/components/BackButton";
import { ArrowLeft, Plus, X, Save, Eye, CheckCircle, Sparkles, Zap, Phone } from "@/components/ui/icon";
import { LocationMapPicker } from "@/components/LocationMapPicker";
import { DomainVerificationDialog } from "@/components/DomainVerificationDialog";
import { DomainSubcategorySelector } from "@/components/DomainSubcategorySelector";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cardApi, isAuthenticated, requireAuth } from "@/services/cardApi";
import { BusinessCardDisplay } from "@/types/business-card";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/hooks/use-language";
import { getSEOText, SupportedLanguage } from "@/utils/seoTranslations";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";

// Validation schema
const phoneSchema = z.string().trim().regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, "Invalid phone number format").optional().or(z.literal(""));

const formSchema = z.object({
  title: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  company: z.string().trim().min(1, "Company is required").max(150, "Company name must be less than 150 characters"),
  domain_key: z.string().min(1, "Please select an industry"),
  subdomain_key: z.string().min(1, "Please select a specialization"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  mobile_phones: z.array(phoneSchema).max(2, "Maximum 2 mobile numbers allowed"),
  landline_phones: z.array(phoneSchema).max(2, "Maximum 2 landline numbers allowed"),
  fax_numbers: z.array(phoneSchema).max(2, "Maximum 2 fax numbers allowed"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  website: z.string().trim().url("Invalid website URL").max(255, "Website URL must be less than 255 characters").optional().or(z.literal("")),
  address: z.string().trim().max(300, "Address must be less than 300 characters").optional(),
  work_hours: z.string().trim().max(100, "Work hours must be less than 100 characters").optional(),
  languages: z.array(z.string().trim().max(50)).max(10, "Maximum 10 languages allowed"),
  tags: z.array(z.string().trim().max(50)).max(20, "Maximum 20 tags allowed"),
});

const CreateCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    domain_key: "",
    subdomain_key: "", // Single subcategory selection
    description: "",
    mobile_phones: [] as string[],
    landline_phones: [] as string[],
    fax_numbers: [] as string[],
    email: "",
    website: "",
    address: "",
    work_hours: "",
    languages: [] as string[],
    tags: [] as string[],
    lat: 24.7136, // Riyadh default
    lng: 46.6753,
    social_links: {
      whatsapp: "",
      instagram: "",
      linkedin: "",
      twitter: ""
    }
  });
  const [currentTag, setCurrentTag] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [currentMobile, setCurrentMobile] = useState("");
  const [currentLandline, setCurrentLandline] = useState("");
  const [currentFax, setCurrentFax] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a business card",
        variant: "destructive"
      });
      navigate("/profile");
    }
  }, [navigate, toast]);

  // Auto-fill domain and subcategory from user profile if verified or pending
  useEffect(() => {
    if (user?.domainKey && user?.subcategoryKey) {
      setFormData(prev => ({
        ...prev,
        domain_key: user.domainKey,
        subdomain_key: user.subcategoryKey,
      }));
    }
  }, [user]);

  // Calculate progress
  const getFormProgress = () => {
    const requiredFields = [formData.title, formData.company, formData.domain_key, formData.subdomain_key];
    const optionalFields = [
      formData.description, 
      formData.email, 
      formData.address, 
      formData.work_hours, 
      formData.languages.length > 0 ? "languages" : "", 
      formData.tags.length > 0 ? "tags" : "",
      formData.mobile_phones.length > 0 ? "mobile" : "",
      formData.landline_phones.length > 0 ? "landline" : "",
      formData.fax_numbers.length > 0 ? "fax" : ""
    ];
    const requiredComplete = requiredFields.filter(field => field).length;
    const optionalComplete = optionalFields.filter(field => field).length;
    return Math.round(requiredComplete / requiredFields.length * 70 + optionalComplete / optionalFields.length * 30);
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  const addLanguage = () => {
    if (currentLanguage.trim() && !formData.languages.includes(currentLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, currentLanguage.trim()]
      }));
      setCurrentLanguage("");
    }
  };
  const removeLanguage = (languageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  // Phone number management functions
  const addMobilePhone = () => {
    if (currentMobile.trim() && formData.mobile_phones.length < 2 && !formData.mobile_phones.includes(currentMobile.trim())) {
      setFormData(prev => ({
        ...prev,
        mobile_phones: [...prev.mobile_phones, currentMobile.trim()]
      }));
      setCurrentMobile("");
    }
  };

  const removeMobilePhone = (phoneToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      mobile_phones: prev.mobile_phones.filter(phone => phone !== phoneToRemove)
    }));
  };

  const addLandlinePhone = () => {
    if (currentLandline.trim() && formData.landline_phones.length < 2 && !formData.landline_phones.includes(currentLandline.trim())) {
      setFormData(prev => ({
        ...prev,
        landline_phones: [...prev.landline_phones, currentLandline.trim()]
      }));
      setCurrentLandline("");
    }
  };

  const removeLandlinePhone = (phoneToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      landline_phones: prev.landline_phones.filter(phone => phone !== phoneToRemove)
    }));
  };

  const addFaxNumber = () => {
    if (currentFax.trim() && formData.fax_numbers.length < 2 && !formData.fax_numbers.includes(currentFax.trim())) {
      setFormData(prev => ({
        ...prev,
        fax_numbers: [...prev.fax_numbers, currentFax.trim()]
      }));
      setCurrentFax("");
    }
  };

  const removeFaxNumber = (faxToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      fax_numbers: prev.fax_numbers.filter(fax => fax !== faxToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Check authentication
    try {
      requireAuth();
    } catch {
      navigate("/profile");
      return;
    }

    // Check domain verification - show dialog if not set
    if (!user?.domainKey || !user?.subcategoryKey) {
      setShowVerificationDialog(true);
      toast({
        title: "Verification Required",
        description: "Please select your domain and upload verification document.",
        variant: "destructive"
      });
      return;
    }

    // Validate form data
    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path.join('.')] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare card data with proper formatting
      const cardDataToSubmit = {
        ...formData,
        // Ensure location is properly structured
        location: {
          lat: formData.lat || 0,
          lng: formData.lng || 0
        }
      };

      console.log('Submitting card data:', cardDataToSubmit);
      
      // Create card using API
      const newCard = await cardApi.createCard(cardDataToSubmit);
      
      // Success toast with next steps
      toast({
        title: "🎉 Card Created Successfully!",
        description: "Redirecting you to view your new card...",
      });
      
      // Navigate to card detail page to show the created card
      setTimeout(() => {
        navigate(`/card/${newCard._id}`);
      }, 800);
    } catch (error) {
      console.error('Failed to create card:', error);
      // Error handling is done in the API service
    } finally {
      setIsSubmitting(false);
    }
  };
  const previewCard: BusinessCardDisplay = {
    _id: "preview",
    id: "preview",
    ...formData,
    phone: formData.mobile_phones[0] || formData.landline_phones[0] || "",
    verified: false,
    scans: 0,
    views: 0,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const seoLang = (language === 'en' || language === 'ar' || language === 'fr') ? language as SupportedLanguage : 'en';

  return <>
      <SEOHead
        title={getSEOText('createTitle', seoLang)}
        description={getSEOText('createDescription', seoLang)}
        url={window.location.href}
        type="website"
      />
      <div className="min-h-screen bg-gradient-hero">
      {/* Beautiful Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-20" />
        <div className="relative z-10 px-4 py-6 sm:py-12">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Link>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="text-white hover:bg-white/10 sm:hidden">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-primary-glow animate-pulse" />
                  <div className="absolute inset-0 w-8 h-8 bg-primary-glow rounded-full opacity-20 animate-ping" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                Create Your Digital Card
              </h1>
              <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
                Build your professional presence and connect with customers instantly
              </p>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                  <span>Progress</span>
                  <span>{getFormProgress()}% complete</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                  <div className="bg-gradient-primary h-2 rounded-full transition-all duration-500 relative overflow-hidden" style={{
                  width: `${getFormProgress()}%`
                }}>
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
            {/* Form */}
            <div className="space-y-4 sm:space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Basic Information - Enhanced */}
                <Card className="bg-gradient-card border-border/50 shadow-card-hover group hover:shadow-glow/10 transition-all animate-slide-up">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="title" className="text-sm font-medium">Full Name *</Label>
                        <Input id="title" value={formData.title} onChange={e => handleInputChange("title", e.target.value)} placeholder="Dr. Ahmed Al-Rahman" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-sm font-medium">Company/Business *</Label>
                        <Input id="company" value={formData.company} onChange={e => handleInputChange("company", e.target.value)} placeholder="Al-Rahman Medical Center" required className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea id="description" value={formData.description} onChange={e => handleInputChange("description", e.target.value)} placeholder="Brief description of your services and expertise..." rows={3} className="mt-1 resize-none" />
                    </div>
                  </CardContent>
                </Card>

                {/* Category Selection - Refactored */}
                <Card className="bg-gradient-card border-border/50 shadow-card-hover">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Category & Specialization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DomainSubcategorySelector
                      selectedDomainKey={formData.domain_key}
                      selectedSubcategoryKey={formData.subdomain_key}
                      onDomainChange={(domainKey) => handleInputChange("domain_key", domainKey)}
                      onSubcategoryChange={(subcategoryKey) => setFormData(prev => ({ ...prev, subdomain_key: subcategoryKey }))}
                      isDisabled={!!user?.domainKey && !!user?.subcategoryKey}
                      verificationStatus={user?.verificationStatus}
                      showQuickPicks={true}
                      quickPicksLimit={6}
                      language={language === 'fr' ? 'fr' : language === 'ar' ? 'ar' : 'en'}
                    />
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    {/* Phone Numbers Section */}
                    <div className="space-y-4">
                      {/* Mobile Phones */}
                      <div>
                        <Label className="text-sm font-medium">Mobile Numbers (Max 2)</Label>
                        <div className="flex gap-2 mt-1 mb-2">
                          <Input
                            value={currentMobile}
                            onChange={e => setCurrentMobile(e.target.value)}
                            placeholder="+966 50 123 4567"
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMobilePhone())}
                            className="flex-1"
                            disabled={formData.mobile_phones.length >= 2}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMobilePhone}
                            disabled={formData.mobile_phones.length >= 2 || !currentMobile.trim()}
                            className="flex-shrink-0 px-3"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.mobile_phones.map((phone, index) => (
                            <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {phone}
                              <button
                                type="button"
                                onClick={() => removeMobilePhone(phone)}
                                className="ml-1.5 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {validationErrors['mobile_phones'] && (
                          <p className="text-sm text-destructive mt-1">{validationErrors['mobile_phones']}</p>
                        )}
                      </div>

                      {/* Landline Phones */}
                      <div>
                        <Label className="text-sm font-medium">Landline Numbers (Max 2)</Label>
                        <div className="flex gap-2 mt-1 mb-2">
                          <Input
                            value={currentLandline}
                            onChange={e => setCurrentLandline(e.target.value)}
                            placeholder="+966 11 234 5678"
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLandlinePhone())}
                            className="flex-1"
                            disabled={formData.landline_phones.length >= 2}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addLandlinePhone}
                            disabled={formData.landline_phones.length >= 2 || !currentLandline.trim()}
                            className="flex-shrink-0 px-3"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.landline_phones.map((phone, index) => (
                            <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {phone}
                              <button
                                type="button"
                                onClick={() => removeLandlinePhone(phone)}
                                className="ml-1.5 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {validationErrors['landline_phones'] && (
                          <p className="text-sm text-destructive mt-1">{validationErrors['landline_phones']}</p>
                        )}
                      </div>

                      {/* Fax Numbers */}
                      <div>
                        <Label className="text-sm font-medium">Fax Numbers (Max 2)</Label>
                        <div className="flex gap-2 mt-1 mb-2">
                          <Input
                            value={currentFax}
                            onChange={e => setCurrentFax(e.target.value)}
                            placeholder="+966 11 234 5679"
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFaxNumber())}
                            className="flex-1"
                            disabled={formData.fax_numbers.length >= 2}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addFaxNumber}
                            disabled={formData.fax_numbers.length >= 2 || !currentFax.trim()}
                            className="flex-shrink-0 px-3"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.fax_numbers.map((fax, index) => (
                            <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                              📠 {fax}
                              <button
                                type="button"
                                onClick={() => removeFaxNumber(fax)}
                                className="ml-1.5 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {validationErrors['fax_numbers'] && (
                          <p className="text-sm text-destructive mt-1">{validationErrors['fax_numbers']}</p>
                        )}
                      </div>
                    </div>

                    {/* Email and Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={e => handleInputChange("email", e.target.value)}
                          placeholder="contact@example.com"
                          className="mt-1"
                        />
                        {validationErrors['email'] && (
                          <p className="text-sm text-destructive mt-1">{validationErrors['email']}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={e => handleInputChange("website", e.target.value)}
                          placeholder="https://www.yourwebsite.com"
                          className="mt-1"
                        />
                        {validationErrors['website'] && (
                          <p className="text-sm text-destructive mt-1">{validationErrors['website']}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={e => handleInputChange("address", e.target.value)}
                        placeholder="Al Malaz District, Riyadh, Saudi Arabia"
                        className="mt-1"
                      />
                      {validationErrors['address'] && (
                        <p className="text-sm text-destructive mt-1">{validationErrors['address']}</p>
                      )}
                    </div>

                    {/* Location Map Picker */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">📍 Service Location</Label>
                      <LocationMapPicker
                        initialLat={formData.lat}
                        initialLng={formData.lng}
                        onLocationSelect={(lat, lng) => {
                          setFormData(prev => ({ ...prev, lat, lng }));
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Location: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="work_hours" className="text-sm font-medium">Working Hours</Label>
                      <Input
                        id="work_hours"
                        value={formData.work_hours}
                        onChange={e => handleInputChange("work_hours", e.target.value)}
                        placeholder="Sun-Thu: 8AM-6PM, Fri: 2PM-8PM"
                        className="mt-1"
                      />
                      {validationErrors['work_hours'] && (
                        <p className="text-sm text-destructive mt-1">{validationErrors['work_hours']}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {/* Languages */}
                    <div>
                      <Label className="text-sm font-medium">Languages Spoken</Label>
                      <div className="flex gap-2 mt-1 mb-2">
                        <Input value={currentLanguage} onChange={e => setCurrentLanguage(e.target.value)} placeholder="e.g., Arabic, English" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())} className="flex-1" />
                        <Button type="button" variant="outline" size="sm" onClick={addLanguage} className="flex-shrink-0 px-3">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {formData.languages.map((language, index) => <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                            {language}
                            <button type="button" onClick={() => removeLanguage(language)} className="ml-1.5 hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>)}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-sm font-medium">Services & Keywords</Label>
                      <div className="flex gap-2 mt-1 mb-2">
                        <Input value={currentTag} onChange={e => setCurrentTag(e.target.value)} placeholder="e.g., family medicine, emergency care" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1" />
                        <Button type="button" variant="outline" size="sm" onClick={addTag} className="flex-shrink-0 px-3">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {formData.tags.map((tag, index) => <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">Social Media</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
                        <Input id="whatsapp" value={formData.social_links.whatsapp} onChange={e => handleSocialLinkChange("whatsapp", e.target.value)} placeholder="+966501234567" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="instagram" className="text-sm font-medium">Instagram</Label>
                        <Input id="instagram" value={formData.social_links.instagram} onChange={e => handleSocialLinkChange("instagram", e.target.value)} placeholder="@yourusername" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</Label>
                        <Input id="linkedin" value={formData.social_links.linkedin} onChange={e => handleSocialLinkChange("linkedin", e.target.value)} placeholder="your-profile-name" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="twitter" className="text-sm font-medium">Twitter</Label>
                        <Input id="twitter" value={formData.social_links.twitter} onChange={e => handleSocialLinkChange("twitter", e.target.value)} placeholder="@yourusername" className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-gradient-primary hover:shadow-glow/20 hover:scale-[1.02] transition-all duration-300 text-white font-semibold rounded-xl shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Create Business Card
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setShowPreview(!showPreview)} 
                    className="sm:w-auto h-12 border-2 border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 rounded-xl font-medium"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Preview
                  </Button>
                </div>
              </form>
            </div>

            {/* Preview */}
            <div className={`space-y-4 sm:space-y-6 ${showPreview ? 'block' : 'hidden xl:block'}`}>
              <div className="sticky top-20 sm:top-32">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Preview</h3>
                {formData.title && formData.company ? <BusinessCard card={previewCard} variant="full" showStats={false} /> : <Card className="bg-gradient-card border-border/50 text-center py-8 sm:py-12">
                    <CardContent>
                      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📇</div>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Fill in the form to see your card preview
                      </p>
                    </CardContent>
                  </Card>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Preview Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-50 xl:hidden">
        
      </div>

      {/* Mobile Preview Overlay */}
      {showPreview && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm xl:hidden animate-fade-in">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 bg-gradient-primary">
              <h3 className="text-white font-semibold">Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {formData.title && formData.company ? <BusinessCard card={previewCard} variant="full" showStats={false} /> : <Card className="bg-gradient-card border-border/50 text-center py-12">
                  <CardContent>
                    <div className="text-6xl mb-4">📇</div>
                    <p className="text-muted-foreground">
                      Fill in the form to see your card preview
                    </p>
                  </CardContent>
                </Card>}
            </div>
          </div>
        </div>}
      </div>
      
      {/* Domain Verification Dialog */}
      <DomainVerificationDialog 
        open={showVerificationDialog} 
        onOpenChange={setShowVerificationDialog}
        onVerificationSubmitted={async () => {
          // Refresh user data after verification
          await refreshUser();
          toast({
            title: "Verification Submitted",
            description: "Your verification is under review. Your card will be created as pending.",
          });
        }}
      />
    </>;
};
export default CreateCard;