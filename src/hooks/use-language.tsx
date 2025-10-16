import { createContext, useContext, useState, ReactNode } from "react"

type Language = "en" | "ar" | "fr"

type LanguageProviderProps = {
  children: ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    explore: "Explore",
    dashboard: "Dashboard", 
    create_card: "Create Card",
    home: "Home",
    favorites: "Favorites",
    create: "Create",
    profile: "Profile",
    
    // Theme
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    
    // Language
    language: "Language",
    english: "English",
    arabic: "العربية",
    french: "Français",
    
    // Common
    search: "Search professionals, services...",
    search_placeholder: "Search professionals (e.g., 'auto parts fiat', 'electrician')...",
    filter: "Filter",
    filters: "Filters",
    clear: "Clear",
    active: "Active",
    all: "All",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    submit: "Submit",
    next: "Next",
    
    // Home page
    find_professionals: "Find professionals near you",
    your_favorites: "Your Favorites",
    filtered_results: "Filtered Results",
    featured_professionals: "Featured Professionals",
    professionals_found: "professional(s) found",
    auto_filtered: "Auto-filtered",
    relevance: "Relevance",
    popular: "Popular",
    top_rated: "Top Rated",
    nearest: "Nearest",
    no_favorites_yet: "No favorites yet",
    no_results_found: "No results found",
    tap_heart_favorites: "Tap the heart icon on cards to add them to your favorites",
    try_adjusting_search: "Try adjusting your search terms or browse different categories",
    adjust_filters: "Adjust Filters",
    are_you_professional: "Are you a professional?",
    create_digital_card_cta: "Create your digital business card and connect with customers",
    create_your_card: "Create Your Card",
    something_went_wrong: "Something went wrong",
    try_again: "Try Again",
    
    // Filter sections
    category_specialization: "Category & Specialization",
    industry: "Industry",
    specialization: "Specialization",
    specialization_multiple: "Specialization (can select multiple)",
    location_range: "Location & Range",
    city: "City",
    any_city: "Any City",
    search_radius: "Search Radius",
    km: "km",
    rating: "Rating",
    min_rating: "Minimum Rating",
    or_higher: "or higher",
    availability: "Availability",
    any_time: "Any Time",
    open_now: "Open Now",
    open_weekends: "Open Weekends",
    tags: "Tags",
    search_tags: "Search by tags",
    other_options: "Other Options",
    verified_only: "Verified Only",
    with_photo: "With Photo",
    languages_spoken: "Languages",
    
    // Create Card
    create_digital_card: "Create Your Digital Card",
    build_professional_presence: "Build your professional presence and connect with customers instantly",
    progress: "Progress",
    complete: "complete",
    basic_information: "Basic Information",
    full_name: "Full Name",
    company_business: "Company/Business",
    description: "Description",
    brief_description: "Brief description of your services and expertise...",
    or_select_all_industries: "Or select from all industries",
    select_specializations: "Select your specializations...",
    contact_information: "Contact Information",
    mobile_phones: "Mobile Phones",
    add_mobile: "Add Mobile",
    landline_phones: "Landline Phones",
    add_landline: "Add Landline",
    fax_numbers: "Fax Numbers",
    add_fax: "Add Fax",
    email_address: "Email Address",
    website: "Website",
    location_address: "Location & Address",
    full_address: "Full Address",
    work_schedule: "Work Schedule",
    work_hours: "Work Hours",
    social_media: "Social Media",
    whatsapp_number: "WhatsApp Number",
    instagram_username: "Instagram Username",
    linkedin_profile: "LinkedIn Profile",
    twitter_handle: "Twitter Handle",
    additional_info: "Additional Information",
    add_tag: "Add Tag",
    add_language: "Add Language",
    preview_card: "Preview Card",
    hide_preview: "Hide Preview",
    live_preview: "Live Preview",
    save_publish: "Save & Publish",
    creating: "Creating...",
    
    // Bottom Nav
    
    // Footer ticker
    categories: "Categories",
    subcategories: "Subcategories",
    cities: "Cities",
    
    // Business Card
    call: "Call",
    whatsapp: "WhatsApp",
    favorite: "Favorite",
    share: "Share",
    views: "views",
    view: "view",
    scans: "scans",
    details: "Details",
    reviews: "Reviews",
    contact: "Contact",
    remove_from_favorites: "Remove from favorites",
    add_to_favorites: "Add to favorites",
    
    // Card Detail
    loading_business_card: "Loading business card...",
    failed_load_card: "Failed to load business card",
    authentication_required: "Authentication Required",
    sign_in_to_message: "Please sign in to send messages",
    total_views: "Total Views",
    message: "Message",
    send_message: "Send Message",
    start_conversation: "Start Conversation",
    
    // Review
    write_review: "Write a Review",
    submit_review: "Submit Review",
    your_rating: "Your Rating",
    your_review: "Your Review",
    
    // Report
    report: "Report",
    report_card: "Report Card",
    
    // Export
    export: "Export",
    download: "Download",
    
    // Actions
    confirm_delete: "Are you sure you want to delete",
    cannot_be_undone: "This action cannot be undone",
    yes_delete: "Yes, delete",
    no_cancel: "No, cancel",
  },
  ar: {
    // Navigation  
    explore: "استكشف",
    dashboard: "لوحة التحكم",
    create_card: "إنشاء بطاقة",
    home: "الرئيسية",
    favorites: "المفضلة",
    create: "إنشاء",
    profile: "الملف الشخصي",
    
    // Theme
    theme: "المظهر",
    dark: "مظلم", 
    light: "فاتح",
    
    // Language
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    french: "Français",
    
    // Common
    search: "البحث عن المهنيين والخدمات...",
    search_placeholder: "ابحث عن المهنيين (مثال: 'قطع غيار فيات'، 'كهربائي')...",
    filter: "تصفية",
    filters: "التصفية",
    clear: "مسح",
    active: "نشط",
    all: "الكل",
    back: "رجوع",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    submit: "إرسال",
    next: "التالي",
    
    // Home page
    find_professionals: "ابحث عن المهنيين بالقرب منك",
    your_favorites: "مفضلاتك",
    filtered_results: "النتائج المصفاة",
    featured_professionals: "المهنيون المميزون",
    professionals_found: "محترف(ون)",
    auto_filtered: "تصفية تلقائية",
    relevance: "الأكثر صلة",
    popular: "الأكثر شعبية",
    top_rated: "الأعلى تقييماً",
    nearest: "الأقرب",
    no_favorites_yet: "لا توجد مفضلات بعد",
    no_results_found: "لم يتم العثور على نتائج",
    tap_heart_favorites: "اضغط على أيقونة القلب لإضافة البطاقات إلى مفضلاتك",
    try_adjusting_search: "حاول تعديل مصطلحات البحث أو تصفح فئات مختلفة",
    adjust_filters: "تعديل التصفية",
    are_you_professional: "هل أنت محترف؟",
    create_digital_card_cta: "أنشئ بطاقة عملك الرقمية وتواصل مع العملاء",
    create_your_card: "أنشئ بطاقتك",
    something_went_wrong: "حدث خطأ ما",
    try_again: "حاول مرة أخرى",
    
    // Filter sections
    category_specialization: "الفئة والتخصص",
    industry: "المجال",
    specialization: "التخصص",
    specialization_multiple: "التخصص (يمكن اختيار عدة)",
    location_range: "الموقع والنطاق",
    city: "المدينة",
    any_city: "أي مدينة",
    search_radius: "نطاق البحث",
    km: "كم",
    rating: "التقييم",
    min_rating: "الحد الأدنى للتقييم",
    or_higher: "أو أعلى",
    availability: "التوفر",
    any_time: "أي وقت",
    open_now: "مفتوح الآن",
    open_weekends: "مفتوح عطلة نهاية الأسبوع",
    tags: "الوسوم",
    search_tags: "البحث بالوسوم",
    other_options: "خيارات أخرى",
    verified_only: "موثق فقط",
    with_photo: "مع صورة",
    languages_spoken: "اللغات",
    
    // Create Card
    create_digital_card: "أنشئ بطاقتك الرقمية",
    build_professional_presence: "بناء حضورك المهني والتواصل مع العملاء على الفور",
    progress: "التقدم",
    complete: "مكتمل",
    basic_information: "المعلومات الأساسية",
    full_name: "الاسم الكامل",
    company_business: "الشركة/النشاط التجاري",
    description: "الوصف",
    brief_description: "وصف موجز لخدماتك وخبرتك...",
    or_select_all_industries: "أو اختر من جميع المجالات",
    select_specializations: "اختر تخصصاتك...",
    contact_information: "معلومات الاتصال",
    mobile_phones: "الهواتف المحمولة",
    add_mobile: "إضافة هاتف محمول",
    landline_phones: "الهواتف الأرضية",
    add_landline: "إضافة هاتف أرضي",
    fax_numbers: "أرقام الفاكس",
    add_fax: "إضافة فاكس",
    email_address: "البريد الإلكتروني",
    website: "الموقع الإلكتروني",
    location_address: "الموقع والعنوان",
    full_address: "العنوان الكامل",
    work_schedule: "جدول العمل",
    work_hours: "ساعات العمل",
    social_media: "وسائل التواصل الاجتماعي",
    whatsapp_number: "رقم واتساب",
    instagram_username: "اسم المستخدم في إنستغرام",
    linkedin_profile: "الملف الشخصي في لينكد إن",
    twitter_handle: "حساب تويتر",
    additional_info: "معلومات إضافية",
    add_tag: "إضافة وسم",
    add_language: "إضافة لغة",
    preview_card: "معاينة البطاقة",
    hide_preview: "إخفاء المعاينة",
    live_preview: "معاينة مباشرة",
    save_publish: "حفظ ونشر",
    creating: "جاري الإنشاء...",
    
    // Bottom Nav
    
    // Footer ticker
    categories: "الفئات",
    subcategories: "الفئات الفرعية",
    cities: "المدن",
    
    // Business Card
    call: "اتصال",
    whatsapp: "واتساب",
    favorite: "المفضلة",
    share: "مشاركة",
    views: "مشاهدات",
    view: "مشاهدة",
    scans: "عمليات المسح",
    details: "التفاصيل",
    reviews: "التقييمات",
    contact: "الاتصال",
    remove_from_favorites: "إزالة من المفضلة",
    add_to_favorites: "إضافة إلى المفضلة",
    
    // Card Detail
    loading_business_card: "جاري تحميل بطاقة العمل...",
    failed_load_card: "فشل تحميل بطاقة العمل",
    authentication_required: "المصادقة مطلوبة",
    sign_in_to_message: "الرجاء تسجيل الدخول لإرسال الرسائل",
    total_views: "إجمالي المشاهدات",
    message: "رسالة",
    send_message: "إرسال رسالة",
    start_conversation: "بدء محادثة",
    
    // Review
    write_review: "كتابة تقييم",
    submit_review: "إرسال التقييم",
    your_rating: "تقييمك",
    your_review: "مراجعتك",
    
    // Report
    report: "بلاغ",
    report_card: "الإبلاغ عن البطاقة",
    
    // Export
    export: "تصدير",
    download: "تحميل",
    
    // Actions
    confirm_delete: "هل أنت متأكد أنك تريد الحذف",
    cannot_be_undone: "لا يمكن التراجع عن هذا الإجراء",
    yes_delete: "نعم، احذف",
    no_cancel: "لا، إلغاء",
  },
  fr: {
    // Navigation
    explore: "Explorer",
    dashboard: "Tableau de bord",
    create_card: "Créer une carte",
    home: "Accueil",
    favorites: "Favoris",
    create: "Créer",
    profile: "Profil",
    
    // Theme
    theme: "Thème",
    dark: "Sombre",
    light: "Clair",
    
    // Language
    language: "Langue",
    english: "English",
    arabic: "العربية",
    french: "Français",
    
    // Common
    search: "Rechercher des professionnels, services...",
    search_placeholder: "Rechercher des professionnels (ex: 'pièces auto fiat', 'électricien')...",
    filter: "Filtrer",
    filters: "Filtres",
    clear: "Effacer",
    active: "Actif",
    all: "Tout",
    back: "Retour",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    submit: "Soumettre",
    next: "Suivant",
    
    // Home page
    find_professionals: "Trouvez des professionnels près de chez vous",
    your_favorites: "Vos Favoris",
    filtered_results: "Résultats Filtrés",
    featured_professionals: "Professionnels en Vedette",
    professionals_found: "professionnel(s) trouvé(s)",
    auto_filtered: "Filtré automatiquement",
    relevance: "Pertinence",
    popular: "Populaire",
    top_rated: "Mieux Notés",
    nearest: "Plus Proches",
    no_favorites_yet: "Pas encore de favoris",
    no_results_found: "Aucun résultat trouvé",
    tap_heart_favorites: "Appuyez sur l'icône cœur sur les cartes pour les ajouter à vos favoris",
    try_adjusting_search: "Essayez d'ajuster vos termes de recherche ou de parcourir différentes catégories",
    adjust_filters: "Ajuster les filtres",
    are_you_professional: "Êtes-vous un professionnel?",
    create_digital_card_cta: "Créez votre carte de visite numérique et connectez-vous avec vos clients",
    create_your_card: "Créer Votre Carte",
    something_went_wrong: "Quelque chose s'est mal passé",
    try_again: "Réessayer",
    
    // Filter sections
    category_specialization: "Catégorie et Spécialisation",
    industry: "Secteur",
    specialization: "Spécialisation",
    specialization_multiple: "Spécialisation (sélection multiple possible)",
    location_range: "Emplacement et Rayon",
    city: "Ville",
    any_city: "N'importe quelle ville",
    search_radius: "Rayon de recherche",
    km: "km",
    rating: "Évaluation",
    min_rating: "Évaluation minimale",
    or_higher: "ou plus",
    availability: "Disponibilité",
    any_time: "N'importe quand",
    open_now: "Ouvert maintenant",
    open_weekends: "Ouvert le week-end",
    tags: "Étiquettes",
    search_tags: "Rechercher par étiquettes",
    other_options: "Autres Options",
    verified_only: "Vérifiés uniquement",
    with_photo: "Avec photo",
    languages_spoken: "Langues",
    
    // Create Card
    create_digital_card: "Créez Votre Carte Numérique",
    build_professional_presence: "Construisez votre présence professionnelle et connectez-vous avec les clients instantanément",
    progress: "Progression",
    complete: "terminé",
    basic_information: "Informations de Base",
    full_name: "Nom Complet",
    company_business: "Entreprise/Commerce",
    description: "Description",
    brief_description: "Brève description de vos services et expertise...",
    or_select_all_industries: "Ou sélectionnez parmi tous les secteurs",
    select_specializations: "Sélectionnez vos spécialisations...",
    contact_information: "Coordonnées",
    mobile_phones: "Téléphones Mobiles",
    add_mobile: "Ajouter Mobile",
    landline_phones: "Téléphones Fixes",
    add_landline: "Ajouter Fixe",
    fax_numbers: "Numéros de Fax",
    add_fax: "Ajouter Fax",
    email_address: "Adresse Email",
    website: "Site Web",
    location_address: "Emplacement et Adresse",
    full_address: "Adresse Complète",
    work_schedule: "Horaires de Travail",
    work_hours: "Heures d'Ouverture",
    social_media: "Réseaux Sociaux",
    whatsapp_number: "Numéro WhatsApp",
    instagram_username: "Nom d'utilisateur Instagram",
    linkedin_profile: "Profil LinkedIn",
    twitter_handle: "Identifiant Twitter",
    additional_info: "Informations Supplémentaires",
    add_tag: "Ajouter Étiquette",
    add_language: "Ajouter Langue",
    preview_card: "Aperçu de la Carte",
    hide_preview: "Masquer l'Aperçu",
    live_preview: "Aperçu en Direct",
    save_publish: "Enregistrer et Publier",
    creating: "Création en cours...",
    
    // Bottom Nav
    
    // Footer ticker
    categories: "Catégories",
    subcategories: "Sous-catégories",
    cities: "Villes",
    
    // Business Card
    call: "Appeler",
    whatsapp: "WhatsApp",
    favorite: "Favori",
    share: "Partager",
    views: "vues",
    view: "vue",
    scans: "scans",
    details: "Détails",
    reviews: "Avis",
    contact: "Contact",
    remove_from_favorites: "Retirer des favoris",
    add_to_favorites: "Ajouter aux favoris",
    
    // Card Detail
    loading_business_card: "Chargement de la carte de visite...",
    failed_load_card: "Échec du chargement de la carte de visite",
    authentication_required: "Authentification Requise",
    sign_in_to_message: "Veuillez vous connecter pour envoyer des messages",
    total_views: "Total des Vues",
    message: "Message",
    send_message: "Envoyer un Message",
    start_conversation: "Démarrer une Conversation",
    
    // Review
    write_review: "Écrire un Avis",
    submit_review: "Soumettre l'Avis",
    your_rating: "Votre Note",
    your_review: "Votre Avis",
    
    // Report
    report: "Signaler",
    report_card: "Signaler la Carte",
    
    // Export
    export: "Exporter",
    download: "Télécharger",
    
    // Actions
    confirm_delete: "Êtes-vous sûr de vouloir supprimer",
    cannot_be_undone: "Cette action ne peut pas être annulée",
    yes_delete: "Oui, supprimer",
    no_cancel: "Non, annuler",
  }
}

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
  t: () => "",
}

const LanguageProviderContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  storageKey = "app-language",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  )

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  const value = {
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(storageKey, language)
      setLanguage(language)
      
      // Update document direction for Arabic
      if (language === "ar") {
        document.documentElement.dir = "rtl"
        document.documentElement.lang = "ar"
      } else {
        document.documentElement.dir = "ltr"
        document.documentElement.lang = language
      }
    },
    t,
  }

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider")

  return context
}