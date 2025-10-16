import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import { ArrowLeft, Save, X, Plus } from "@/components/ui/icon";

import { LocationMapPicker } from "@/components/LocationMapPicker";
import { getDomainIcon } from "@/utils/categoryIcons";
import { domains } from "@/data/domains";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cardApi, isAuthenticated } from "@/services/cardApi";
import { BusinessCard } from "@/types/business-card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";

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

const EditCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    domain_key: "",
    subdomain_key: "",
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
    lat: 24.7136,
    lng: 46.6753,
    social_links: {
      whatsapp: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      snapchat: "",
      tiktok: "",
      facebook: ""
    }
  });
  const [currentTag, setCurrentTag] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [currentMobile, setCurrentMobile] = useState("");
  const [currentLandline, setCurrentLandline] = useState("");
  const [currentFax, setCurrentFax] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit cards",
        variant: "destructive"
      });
      navigate("/profile");
      return;
    }

    const loadCard = async () => {
      if (!id) return;

      try {
        const loadedCard = await cardApi.getCard(id);
        // Populate form with card data
        setFormData({
          title: loadedCard.title,
          company: loadedCard.company,
          domain_key: loadedCard.domain_key,
          subdomain_key: Array.isArray(loadedCard.subdomain_key) 
            ? loadedCard.subdomain_key[0] 
            : loadedCard.subdomain_key,
          description: loadedCard.description || "",
          mobile_phones: loadedCard.mobile_phones || [],
          landline_phones: loadedCard.landline_phones || [],
          fax_numbers: loadedCard.fax_numbers || [],
          email: loadedCard.email || "",
          website: loadedCard.website || "",
          address: loadedCard.address || "",
          work_hours: loadedCard.work_hours || "",
          languages: loadedCard.languages || [],
          tags: loadedCard.tags || [],
          lat: loadedCard.location?.lat || 24.7136,
          lng: loadedCard.location?.lng || 46.6753,
          social_links: {
            whatsapp: loadedCard.social_links?.whatsapp || "",
            instagram: loadedCard.social_links?.instagram || "",
            linkedin: loadedCard.social_links?.linkedin || "",
            twitter: loadedCard.social_links?.twitter || "",
            snapchat: loadedCard.social_links?.snapchat || "",
            tiktok: loadedCard.social_links?.tiktok || "",
            facebook: loadedCard.social_links?.facebook || ""
          }
        });
      } catch (error) {
        console.error('Failed to load card:', error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [id, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value }
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addLanguage = () => {
    if (currentLanguage.trim() && !formData.languages.includes(currentLanguage.trim())) {
      setFormData(prev => ({ ...prev, languages: [...prev.languages, currentLanguage.trim()] }));
      setCurrentLanguage("");
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setFormData(prev => ({ ...prev, languages: prev.languages.filter(lang => lang !== languageToRemove) }));
  };

  const addMobilePhone = () => {
    if (currentMobile.trim() && formData.mobile_phones.length < 2) {
      setFormData(prev => ({ ...prev, mobile_phones: [...prev.mobile_phones, currentMobile.trim()] }));
      setCurrentMobile("");
    }
  };

  const removeMobilePhone = (phoneToRemove: string) => {
    setFormData(prev => ({ ...prev, mobile_phones: prev.mobile_phones.filter(p => p !== phoneToRemove) }));
  };

  const addLandlinePhone = () => {
    if (currentLandline.trim() && formData.landline_phones.length < 2) {
      setFormData(prev => ({ ...prev, landline_phones: [...prev.landline_phones, currentLandline.trim()] }));
      setCurrentLandline("");
    }
  };

  const removeLandlinePhone = (phoneToRemove: string) => {
    setFormData(prev => ({ ...prev, landline_phones: prev.landline_phones.filter(p => p !== phoneToRemove) }));
  };

  const addFaxNumber = () => {
    if (currentFax.trim() && formData.fax_numbers.length < 2) {
      setFormData(prev => ({ ...prev, fax_numbers: [...prev.fax_numbers, currentFax.trim()] }));
      setCurrentFax("");
    }
  };

  const removeFaxNumber = (faxToRemove: string) => {
    setFormData(prev => ({ ...prev, fax_numbers: prev.fax_numbers.filter(f => f !== faxToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setValidationErrors({});

    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) errors[err.path.join('.')] = err.message;
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
      const updateData = {
        ...formData,
        location: { lat: formData.lat || 0, lng: formData.lng || 0 }
      };

      await cardApi.updateCard(id, updateData);
      
      setTimeout(() => {
        navigate(`/card/${id}`);
      }, 800);
    } catch (error) {
      console.error('Failed to update card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDomain = domains.find(d => d.key === formData.domain_key);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Edit ${formData.title} | Update Business Card`}
        description={`Update your professional business card information for ${formData.title}`}
        url={window.location.href}
        type="profile"
      />
      <div className="min-h-screen bg-gradient-hero">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <div className="relative z-10 px-4 py-6">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <BackButton fallbackPath={`/card/${id}`} label="Back to Card" />
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Edit Business Card
                </h1>
                <p className="text-lg text-white/80">
                  Update your professional information
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Full Name *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={e => handleInputChange("title", e.target.value)}
                        placeholder="Dr. Ahmed Al-Rahman"
                        required
                      />
                      {validationErrors.title && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.title}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Business *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={e => handleInputChange("company", e.target.value)}
                        placeholder="Al-Rahman Medical Center"
                        required
                      />
                      {validationErrors.company && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.company}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e => handleInputChange("description", e.target.value)}
                      placeholder="Brief description of your services..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Selection - Read Only */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Category & Specialization</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Domain and subcategory cannot be changed after creation
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Industry *</Label>
                    <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center text-primary">
                          {selectedDomain && getDomainIcon(selectedDomain.key)}
                        </div>
                        <div>
                          <p className="font-medium">{selectedDomain?.fr || formData.domain_key}</p>
                          <p className="text-xs text-muted-foreground">Industry category (locked)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedDomain && selectedDomain.subcategories && (
                    <div>
                      <Label>Specialization *</Label>
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                        <Badge variant="secondary" className="text-sm">
                          {selectedDomain.subcategories.find(s => s.key === formData.subdomain_key)?.fr || formData.subdomain_key}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">Specialization (locked)</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mobile Phones */}
                  <div>
                    <Label>Mobile Phones (Max 2)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={currentMobile}
                        onChange={e => setCurrentMobile(e.target.value)}
                        placeholder="+966 50 123 4567"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMobilePhone())}
                      />
                      <Button type="button" onClick={addMobilePhone} disabled={formData.mobile_phones.length >= 2}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.mobile_phones.map(phone => (
                        <Badge key={phone} variant="secondary">
                          {phone}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeMobilePhone(phone)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Landline Phones */}
                  <div>
                    <Label>Landline Phones (Max 2)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={currentLandline}
                        onChange={e => setCurrentLandline(e.target.value)}
                        placeholder="+966 11 234 5678"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLandlinePhone())}
                      />
                      <Button type="button" onClick={addLandlinePhone} disabled={formData.landline_phones.length >= 2}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.landline_phones.map(phone => (
                        <Badge key={phone} variant="secondary">
                          {phone}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeLandlinePhone(phone)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Fax Numbers */}
                  <div>
                    <Label>Fax Numbers (Max 2)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={currentFax}
                        onChange={e => setCurrentFax(e.target.value)}
                        placeholder="+966 11 234 5679"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFaxNumber())}
                      />
                      <Button type="button" onClick={addFaxNumber} disabled={formData.fax_numbers.length >= 2}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.fax_numbers.map(fax => (
                        <Badge key={fax} variant="secondary">
                          {fax}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeFaxNumber(fax)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => handleInputChange("email", e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={e => handleInputChange("website", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={e => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street, City"
                    />
                  </div>
                  <LocationMapPicker
                    initialLat={formData.lat}
                    initialLng={formData.lng}
                    onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                    useGeolocation={false}
                  />
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="work_hours">Work Hours</Label>
                    <Input
                      id="work_hours"
                      value={formData.work_hours}
                      onChange={e => handleInputChange("work_hours", e.target.value)}
                      placeholder="Mon-Fri: 9AM-5PM"
                    />
                  </div>

                  <div>
                    <Label>Languages</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentLanguage}
                        onChange={e => setCurrentLanguage(e.target.value)}
                        placeholder="Add language"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <Button type="button" onClick={addLanguage}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.languages.map(lang => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeLanguage(lang)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={e => setCurrentTag(e.target.value)}
                        placeholder="Add tag"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.social_links.whatsapp}
                        onChange={e => handleSocialLinkChange("whatsapp", e.target.value)}
                        placeholder="+966501234567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.social_links.instagram}
                        onChange={e => handleSocialLinkChange("instagram", e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.social_links.linkedin}
                        onChange={e => handleSocialLinkChange("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={formData.social_links.twitter}
                        onChange={e => handleSocialLinkChange("twitter", e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/card/${id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-primary"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCard;
