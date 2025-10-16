import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Icon } from "@/components/ui/icon";
import { ProfileDomainSelection } from "@/components/ProfileDomainSelection";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/hooks/use-language";
import { getSEOText, SupportedLanguage } from "@/utils/seoTranslations";
import { useAuth } from "@/hooks/use-auth";
import { adminApi } from "@/services/adminApi";
import { PackageCard } from "@/components/user/PackageCard";
import { Footer } from "@/components/Footer";

const countries = [
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
];

export default function Profile() {
  const { language } = useLanguage();
  const { user, isLoading: authLoading, isAuthenticated, login, logout, updateProfile } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState("DZ");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Check admin role when user is authenticated
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && !checkingAdmin) {
        setCheckingAdmin(true);
        try {
          const isAdminUser = await adminApi.checkAdminRole();
          setIsAdmin(isAdminUser);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else if (!isAuthenticated) {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated]);

  // Toast notification function
  const showToast = useCallback((title, description, variant = "default") => {
    const id = Date.now();
    const newNotification = { id, title, description, variant };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);


  // Load Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      // Remove existing script if any
      const existingScript = document.querySelector(
        'script[src*="accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initializeGoogleSignIn();
      };

      script.onerror = () => {
        console.error("Failed to load Google script");
        showToast(
          "⚠️ Google Sign-In Error",
          "Failed to load Google authentication. Please refresh the page.",
          "destructive"
        );
      };

      document.head.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      const script = document.querySelector(
        'script[src*="accounts.google.com/gsi/client"]'
      );
      if (script) {
        script.remove();
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id:
            "208998804549-hjvapjlje22kfhfmrkmiqsqnfqu6gmim.apps.googleusercontent.com",
          callback: handleGoogleSignIn,
          auto_select: false,
          ux_mode: "popup", // Use popup mode instead of redirect
          context: "signin",
        } as any);
        setGoogleLoaded(true);
      } catch (error) {
        console.error("Google initialization error:", error);
        showToast(
          "⚠️ Setup Error",
          "Google Sign-In setup failed. Please try refreshing the page.",
          "destructive"
        );
      }
    } else {
      console.error("Google Identity Services not available");
      setTimeout(initializeGoogleSignIn, 1000); // Retry after 1 second
    }
  };


  const handleGoogleSignIn = async (response) => {
    if (!response.credential) {
      console.error("No credential received from Google");
      return;
    }

    setIsSigningIn(true);

    try {
      await login(response.credential);
      showToast("🎉 Welcome!", "Successfully signed in!", "success");
    } catch (error) {
      console.error("Google Sign In error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast(
          "🔗 Connection Error",
          "Cannot connect to server. Make sure your API is running on localhost:3000",
          "destructive"
        );
      } else {
        showToast(
          "📶 Network Error",
          error.message || "Authentication failed. Please try again.",
          "destructive"
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignInClick = () => {
    if (!googleLoaded || !window.google?.accounts?.id) {
      showToast(
        "⏳ Loading",
        "Google Sign-In is still loading. Please wait a moment.",
        "default"
      );
      return;
    }

    try {
      // Create a temporary container for the Google button
      const existingContainer = document.getElementById("temp-google-button");
      if (existingContainer) {
        existingContainer.remove();
      }

      const container = document.createElement("div");
      container.id = "temp-google-button";
      container.style.position = "fixed";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      // Render the actual Google button (this bypasses the One Tap issues)
      (window.google.accounts.id as any).renderButton(container, {
        theme: "outline",
        size: "large",
        width: 350,
        text: "continue_with",
        shape: "rectangular",
        click_listener: () => {
          // This will trigger the sign-in flow
        },
      });

      // Programmatically click the rendered button
      setTimeout(() => {
        const googleButton = container.querySelector('div[role="button"]');
        if (googleButton) {
          (googleButton as HTMLElement).click();
        } else {
          // Fallback to prompt if button render fails
          (window.google.accounts.id as any).prompt((notification: any) => {
            if (
              notification.isNotDisplayed() ||
              notification.isSkippedMoment()
            ) {
              showToast(
                "⚠️ Sign-In Blocked",
                "Google sign-in was blocked. Please disable popup blockers and try again.",
                "warning"
              );
            }
          });
        }
      }, 100);
    } catch (error) {
      console.error("Google sign-in error:", error);
      showToast(
        "⚠️ Sign-In Error",
        "Failed to initialize Google sign-in. Please refresh the page.",
        "destructive"
      );
    }
  };

  const handleLogout = () => {
    logout();
    showToast("👋 Goodbye!", "You've been signed out successfully.", "success");
  };

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      setIsEditing(false);
      showToast("✅ Success!", "Profile updated successfully", "success");
    } catch (error) {
      console.error("Update error:", error);
      showToast(
        "❌ Update Failed",
        error instanceof Error ? error.message : "Failed to update profile",
        "destructive"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCountryData = countries.find((c) => c.code === selectedCountry);
  const seoLang = (language === 'en' || language === 'ar' || language === 'fr') ? language as SupportedLanguage : 'en';

  return (
    <>
      <SEOHead
        title={getSEOText('profileTitle', seoLang)}
        description={getSEOText('profileDescription', seoLang)}
        url={window.location.href}
        type="profile"
      />
      <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Toast Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl shadow-elegant border animate-slide-up max-w-sm ${
                notification.variant === "destructive"
                  ? "bg-destructive/10 border-destructive/20 text-destructive"
                  : notification.variant === "success"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : notification.variant === "warning"
                  ? "bg-secondary/10 border-secondary/20 text-secondary-foreground"
                  : "bg-card border-border text-card-foreground"
              }`}
            >
              <div className="font-semibold text-sm">{notification.title}</div>
              <div className="text-xs mt-1 opacity-90">
                {notification.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-xs text-muted-foreground">
                {isAuthenticated ? "Welcome back!" : "Sign in to continue"}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <FeedbackModal cardId="profile" cardTitle="Profile Page" />
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-md lg:max-w-6xl mx-auto space-y-6">
        {!isAuthenticated ? (
          /* Login Form */
          <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden animate-fade-in">
            <div className="text-center p-6 space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-card-foreground">Sign In</h2>
              <p className="text-muted-foreground text-sm">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="p-6 pt-0">
              <div className="space-y-4">
                {/* Google Sign In Button */}
                <div id="google-signin-button">
                  <button
                    onClick={handleGoogleSignInClick}
                    disabled={isSigningIn || authLoading || !googleLoaded}
                    className="w-full h-14 bg-card hover:bg-muted/50 text-card-foreground border-2 border-border rounded-xl shadow-card-hover hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-3"
                  >
                     {isSigningIn || authLoading ? (
                       <>
                         <div className="animate-spin w-5 h-5">
                           <svg
                             className="w-full h-full"
                             fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24"
                           >
                             <path
                               strokeLinecap="round"
                               strokeLinejoin="round"
                               strokeWidth={2}
                               d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                             />
                           </svg>
                         </div>
                         <span>Signing in...</span>
                       </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Secure Authentication
                    </span>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground space-y-1">
                  <p>By continuing, you agree to our Terms of Service</p>
                  <p>and Privacy Policy</p>
                </div>
              </div>
            </div>
          </div>
        ) : authLoading ? (
          /* Loading State */
          <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden animate-fade-in">
             <div className="text-center p-12 space-y-6">
               <div className="mx-auto">
                 <div className="animate-spin w-12 h-12 text-primary">
                   <svg
                     className="w-full h-full"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                     />
                   </svg>
                 </div>
               </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-card-foreground">Loading Profile...</h2>
                <p className="text-muted-foreground text-sm animate-pulse">
                  Please wait while we fetch your information
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* User Profile */
          <div className="space-y-6 animate-fade-in">
            {/* Desktop: 2-column layout */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
              {/* Left Column: User Info & Forms */}
              <div className="lg:col-span-1 space-y-6">
                {/* User Info Card */}
                <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden">
                  <div className="text-center p-6">
                    <div className="mx-auto mb-4">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-20 h-20 rounded-full border-4 border-primary/20 shadow-glow mx-auto"
                        />
                      ) : (
                        <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                          <svg
                            className="w-12 h-12 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-card-foreground">
                      Welcome, {user?.fullName || "User"}!
                    </h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>

                  <div className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-card-foreground"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    value={isEditing ? formData.firstName : (user?.firstName || "")}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    readOnly={!isEditing}
                    placeholder="Enter your first name"
                    className="w-full h-12 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-card-foreground"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    value={isEditing ? formData.lastName : (user?.lastName || "")}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    readOnly={!isEditing}
                    placeholder="Enter your last name"
                    className="w-full h-12 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-card-foreground"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    value={isEditing ? formData.phone : (user?.phone || "")}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    readOnly={!isEditing}
                    placeholder="Enter your phone number"
                    className="w-full h-12 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground disabled:opacity-60"
                  />
                </div>

                {/* Edit/Save Buttons */}
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="w-full h-12 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex-1 h-12 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all duration-200 active:scale-95 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 h-12 bg-gradient-primary text-primary-foreground rounded-xl font-semibold shadow-elegant hover:shadow-glow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin w-4 h-4">
                            <svg
                              className="w-full h-full"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

                {/* Country Selector */}
                <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2 mb-4">
                      <svg
                        className="w-5 h-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Country / Region
                    </h3>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full h-12 px-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-input text-foreground"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Package & Domain */}
              <div className="lg:col-span-2 space-y-6">
                {/* Subscription Package */}
                <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden">
                  <PackageCard />
                </div>

                {/* Domain Selection & Verification */}
                <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden">
                  <ProfileDomainSelection />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isAdmin && (
                <Link 
                  to="/admin"
                  className="w-full h-12 bg-accent text-accent-foreground rounded-xl font-semibold shadow-elegant hover:shadow-glow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Admin Dashboard
                </Link>
              )}
              <Link 
                to="/dashboard"
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold shadow-elegant hover:shadow-glow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                My Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full h-12 border-2 border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
      </div>
    </>
  );
}
